import { NextRequest, NextResponse } from 'next/server'

const GITHUB_RAW = 'https://raw.githubusercontent.com/Federicohung/jobhunter-pro/master'

async function fetchGithub(path: string): Promise<string> {
  const res = await fetch(`${GITHUB_RAW}/${path}?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`GitHub fetch failed: ${path}`)
  return res.text()
}

export async function POST(req: NextRequest) {
  try {
    const { vacancyId } = await req.json()
    if (!vacancyId) return NextResponse.json({ error: 'missing vacancyId' }, { status: 400 })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'no_openai_key' }, { status: 500 })

    // Load panel
    const panelText = await fetchGithub('data/panel.json')
    const panel = JSON.parse(panelText)

    const vacancy = panel.vacancies.find((v: any) => v.id === vacancyId)
      || panel.applications.find((a: any) => a.id === vacancyId)
    if (!vacancy) return NextResponse.json({ error: 'vacancy_not_found' }, { status: 404 })

    // Load base CV
    const cvBase = vacancy.cvRecommendation?.cvBase || 'general'
    const cvMarkdown = await fetchGithub(`data/cv/${cvBase}.md`)

    // Build prompt
    const prompt = `Eres un experto en reclutamiento y optimizacion de CVs para el mercado hispanohablante.

TAREA: Adapta el siguiente CV para la posicion especificada. Genera tambien una carta de presentacion.

REGLAS ESTRICTAS:
- NO inventes experiencia, logros, habilidades ni formacion que no esten en el CV original
- Puedes REORDENAR y REENFATIZAR secciones para que coincidan con el puesto
- Mantener el mismo formato markdown
- Carta de presentacion: maximo 200 palabras, profesional, en espanol
- El idioma del CV y carta debe ser espanol
- Respond SOLO con JSON, sin texto adicional

POSICION:
Empresa: ${vacancy.company}
Rol: ${vacancy.role}
Ubicacion: ${vacancy.location}
Match: ${vacancy.matchScore}%
Notas: ${vacancy.notes || 'Sin notas'}
Recomendacion de adaptacion: ${vacancy.cvRecommendation?.adapt || ''}

CV BASE:
${cvMarkdown}

Responde con este JSON exacto:
{
  "cvMarkdown": "...",
  "coverLetter": "...",
  "cvBase": "${cvBase}",
  "suggestions": ["sugerencia 1", "sugerencia 2"]
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: 'openai_failed', detail: err }, { status: 502 })
    }

    const data = await response.json()
    let content = data.choices[0]?.message?.content || ''

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'no_json_in_response', raw: content }, { status: 502 })

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json({ success: true, vacancy: vacancy.company, cvBase, ...result })
  } catch (err) {
    return NextResponse.json({ error: 'server_error', detail: String(err) }, { status: 500 })
  }
}

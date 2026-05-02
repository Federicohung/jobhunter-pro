import { NextRequest, NextResponse } from 'next/server'

const GITHUB_API = 'https://api.github.com'
const REPO = 'Federicohung/jobhunter-pro'
const PATH = 'data/panel.json'

export async function POST(req: NextRequest) {
  try {
    const { vacancyId, action } = await req.json()
    if (!vacancyId || !action) {
      return NextResponse.json({ error: 'missing_params' }, { status: 400 })
    }

    const token = process.env.GITHUB_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'no_github_token' }, { status: 500 })
    }

    // 1. Get current file
    const getFile = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${PATH}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
    })
    if (!getFile.ok) return NextResponse.json({ error: 'github_get_failed' }, { status: 502 })

    const fileData = await getFile.json()
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
    const panel = JSON.parse(content)

    // 2. Find vacancy and update
    const vacIdx = panel.vacancies?.findIndex((v: any) => v.id === vacancyId)
    if (vacIdx === -1 || vacIdx === undefined) {
      return NextResponse.json({ error: 'vacancy_not_found' }, { status: 404 })
    }

    if (action === 'apply') {
      const vacancy = panel.vacancies.splice(vacIdx, 1)[0]
      vacancy.status = 'applied'
      vacancy.appliedDate = new Date().toISOString().split('T')[0]
      panel.applications = panel.applications || []
      panel.applications.unshift(vacancy)
      panel.stats = {
        totalApplications: (panel.stats?.totalApplications || 0) + 1,
        vacanciesPending: panel.vacancies.length,
        interviews: panel.stats?.interviews || 0,
      }
    } else if (action === 'skip') {
      panel.vacancies[vacIdx].status = 'skip'
    } else {
      return NextResponse.json({ error: 'invalid_action' }, { status: 400 })
    }

    panel.updatedAt = new Date().toISOString()

    // 3. Push back to GitHub
    const newContent = Buffer.from(JSON.stringify(panel, null, 2)).toString('base64')
    const updateRes = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${PATH}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
      body: JSON.stringify({
        message: `panel: ${action === 'apply' ? 'applied' : 'skipped'} vacancy #${vacancyId}`,
        content: newContent,
        sha: fileData.sha,
      })
    })

    if (!updateRes.ok) {
      const err = await updateRes.text()
      return NextResponse.json({ error: 'github_put_failed', detail: err }, { status: 502 })
    }

    return NextResponse.json({ success: true, panel })
  } catch (err) {
    return NextResponse.json({ error: 'server_error', detail: String(err) }, { status: 500 })
  }
}

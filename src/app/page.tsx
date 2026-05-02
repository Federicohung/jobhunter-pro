'use client'

import { useEffect, useState, useCallback } from 'react'

const PIPELINE = [
  { key: 'identificada', label: 'Identificadas', color: '#3b8bff', bg: 'rgba(59,139,255,0.15)' },
  { key: 'aplicada', label: 'Aplicadas', color: '#00e87b', bg: 'rgba(0,232,123,0.15)' },
  { key: 'entrevista', label: 'Entrevista', color: '#ff6b35', bg: 'rgba(255,107,53,0.15)' },
  { key: 'oferta', label: 'Oferta', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  { key: 'rechazada', label: 'Rechazadas', color: '#ff4757', bg: 'rgba(255,71,87,0.15)' },
]

const ST: Record<string, { l: string; c: string; b: string }> = {
  pending: { l: 'Pendiente', c: '#3b8bff', b: 'rgba(59,139,255,0.15)' },
  applied: { l: 'Aplicada', c: '#00e87b', b: 'rgba(0,232,123,0.15)' },
  skip: { l: 'Descartada', c: '#555', b: 'rgba(85,85,85,0.15)' },
  entrevista: { l: 'Entrevista', c: '#ff6b35', b: 'rgba(255,107,53,0.15)' },
  oferta: { l: 'Oferta', c: '#a855f7', b: 'rgba(168,85,247,0.15)' },
  rechazada: { l: 'Rechazada', c: '#ff4757', b: 'rgba(255,71,87,0.15)' },
}

const CV_LABELS: Record<string, string> = {
  general: 'General',
  csatc: 'Comercial / KAM',
  operations: 'Operaciones',
  accounts: 'Finanzas / Cuentas',
}

function mcolor(s: number) { return s >= 80 ? '#00e87b' : s >= 70 ? '#ff6b35' : s >= 60 ? '#3b8bff' : '#8888a0' }

function Modal({ show, onClose, title, children }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!show) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a2a', border: '1px solid #2a2a3a', borderRadius: 16, maxWidth: 800, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.2rem', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Home() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'applied'>('all')
  const [search, setSearch] = useState('')
  const [acting, setActing] = useState<string | null>(null)
  const [modal, setModal] = useState<{ type: string; v: any } | null>(null)
  const [genLoading, setGenLoading] = useState(false)
  const [genResult, setGenResult] = useState<any>(null)
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(async () => {
    try { const r = await fetch('/api/panel'); const d = await r.json(); if (d.vacancies) setData(d) } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t) } }, [toast])

  const vacs = data?.vacancies || []
  const apps = data?.applications || []

  const filtered = vacs
    .filter((v: any) => filter === 'all' || (filter === 'pending' ? v.status === 'pending' : v.status === 'applied'))
    .filter((v: any) => { if (!search) return true; const q = search.toLowerCase(); return (v.company + v.role + v.location + (v.notes || '')).toLowerCase().includes(q) })
    .sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0))

  const filteredApps = apps
    .filter((a: any) => filter === 'all' || filter === 'applied')
    .filter((a: any) => { if (!search) return true; const q = search.toLowerCase(); return (a.company + a.role + (a.notes || '')).toLowerCase().includes(q) })

  async function handleApply(v: any) {
    setActing(String(v.id))
    try {
      await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vacancyId: v.id, action: 'apply' }) })
      await load()
      setToast(v.company + ' marcada como aplicada')
      setModal({ type: 'generate', v: { ...v, status: 'applied' } })
    } catch { setToast('Error al aplicar') }
    setActing(null)
  }

  async function handleSkip(id: number) {
    setActing(String(id))
    await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vacancyId: id, action: 'skip' }) })
    await load()
    setToast('Descartada')
    setActing(null)
  }

  async function handleGenerate(v: any) {
    setGenLoading(true)
    setGenResult(null)
    try {
      const r = await fetch('/api/generate-cv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vacancyId: v.id }) })
      const d = await r.json()
      if (d.success) setGenResult(d)
      else setGenResult({ error: d.error, detail: d.detail })
    } catch { setGenResult({ error: 'connection_error' }) }
    setGenLoading(false)
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text)
    setToast('Copiado al portapapeles')
  }

  const stats = [
    { label: 'Vacantes', value: vacs.length, c: '#3b8bff' },
    { label: 'Aplicadas', value: apps.length, c: '#00e87b' },
    { label: 'Match Prom', value: vacs.length ? Math.round(vacs.reduce((s: number, v: any) => s + (v.matchScore || 0), 0) / vacs.length) + '%' : '-', c: '#a855f7' },
  ]

  const updatedStr = data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#8888a0', fontSize: '1.2rem' }}>Cargando vacantes...</div>

  const cardStyle: React.CSSProperties = { background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 14, padding: '1rem 1.25rem' }
  const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: '0.5rem' }
  const titleStyle: React.CSSProperties = { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '0.95rem' }
  const roleStyle: React.CSSProperties = { color: '#c8c8d8', fontSize: '0.82rem', fontWeight: 500 }
  const metaStyle: React.CSSProperties = { color: '#8888a0', fontSize: '0.72rem', marginTop: '0.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }
  const badgeStyle = (color: string, bg: string): React.CSSProperties => ({ background: bg, color, padding: '0.1rem 0.45rem', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700 })
  const btnStyle = (bg: string, color: string, border?: string): React.CSSProperties => ({ background: bg, color, padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, border: border || 'none', cursor: 'pointer' })
  const linkStyle: React.CSSProperties = { background: '#3b8bff', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' as const }
  const btnRowStyle: React.CSSProperties = { display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' as const }

  function VacCard({ v, isApp }: { v: any; isApp?: boolean }) {
    const st = ST[v.status] || ST.pending
    const color = mcolor(v.matchScore || 0)
    const cvr = v.cvRecommendation || {}
    return (
      <div style={cardStyle}>
        <div style={rowStyle}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', flexWrap: 'wrap' as const }}>
              <span style={titleStyle}>{v.company}</span>
              <span style={badgeStyle(color, color + '20')}>{v.matchScore || 0}%</span>
              <span style={badgeStyle(st.c, st.b)}>{st.l}</span>
              {v.needsCvVersion && <span style={badgeStyle('#ffaa00', 'rgba(255,170,0,0.15)')}>CV</span>}
            </div>
            <div style={roleStyle}>{v.role}</div>
            <div style={metaStyle}>
              <span>{v.location}</span>
              <span style={{ color: '#666' }}>{CV_LABELS[cvr.cvBase] || 'General'}</span>
              {v.foundDate && <span>{v.foundDate}</span>}
              {v.appliedDate && <span>{v.appliedDate}</span>}
            </div>
            {cvr.adapt && <div style={{ color: '#555570', fontSize: '0.68rem', marginTop: '0.25rem' }}>{cvr.adapt}</div>}
          </div>
          <div style={btnRowStyle}>
            {v.searchUrl && <a href={v.searchUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>Ver Oferta</a>}
            {!isApp && v.status === 'pending' && <>
              <button disabled={acting === String(v.id)} onClick={() => handleApply(v)} style={{ ...btnStyle('#00e87b', '#000'), fontWeight: 700, opacity: acting === String(v.id) ? 0.5 : 1 }}>Ya Aplique</button>
              <button disabled={acting === String(v.id)} onClick={() => handleSkip(v.id)} style={{ ...btnStyle('#2a2a3a', '#888', '#444'), fontSize: '0.65rem', opacity: acting === String(v.id) ? 0.5 : 1 }}>Descartar</button>
            </>}
            {isApp && <button onClick={() => { setGenResult(null); setModal({ type: 'generate', v }) }} style={btnStyle('#a855f720', '#a855f7', '#a855f740')}>Generar CV</button>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: '#1a1a2a', border: '1px solid #2a2a3a', borderRadius: 10, padding: '0.75rem 1.25rem', color: '#e8e8ef', fontSize: '0.85rem', zIndex: 2000, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>{toast}</div>}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid #2a2a3a', marginBottom: '2rem', flexWrap: 'wrap' as const, gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#00e87b,#00b862)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#000' }}>JP</div>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.6rem', fontWeight: 700 }}>JobHunter <span style={{ color: '#00e87b' }}>Pro</span></h1>
            <p style={{ color: '#8888a0', fontSize: '0.75rem' }}>{updatedStr} - {vacs.length} vacantes - {apps.length} aplicadas</p>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 14, padding: '1.25rem' }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '2rem', fontWeight: 700, color: s.c }}>{s.value}</div>
            <div style={{ color: '#8888a0', fontSize: '0.8rem', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' as const, alignItems: 'center' }}>
        <input placeholder='Buscar empresa, rol, ubicacion...' value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 10, padding: '0.6rem 1rem', color: '#e8e8ef', fontSize: '0.85rem', outline: 'none' }} />
        {(['all', 'pending', 'applied'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? '#3b8bff' : '#12121a', border: '1px solid ' + (filter === f ? '#3b8bff' : '#2a2a3a'), borderRadius: 8, padding: '0.5rem 1rem', color: filter === f ? '#fff' : '#8888a0', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            {f === 'all' ? 'Todas (' + vacs.length + ')' : f === 'pending' ? 'Pendientes (' + vacs.filter((v: any) => v.status === 'pending').length + ')' : 'Aplicadas (' + apps.length + ')'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: '0.5rem', marginBottom: '2rem' }}>
        {PIPELINE.map((s, i) => {
          const c = i === 0 ? vacs.filter((a: any) => a.status === 'pending').length : apps.filter((a: any) => a.status === s.key).length
          return <div key={i} style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 10, padding: '0.75rem', textAlign: 'center' as const }}><div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{c}</div><div style={{ color: '#8888a0', fontSize: '0.65rem', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div></div>
        })}
      </div>

      {filtered.length > 0 && <>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#8888a0' }}>{filtered.length} vacantes pendientes</h2>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem', marginBottom: '3rem' }}>
          {filtered.map((v: any, i: number) => <VacCard key={v.id || i} v={v} />)}
        </div>
      </>}

      {filteredApps.length > 0 && <>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#00e87b' }}>Aplicaciones enviadas ({apps.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem', marginBottom: '3rem' }}>
          {filteredApps.map((a: any, i: number) => <VacCard key={a.id || i} v={a} isApp />)}
        </div>
      </>}

      {filtered.length === 0 && filteredApps.length === 0 && (
        <div style={{ background: '#12121a', border: '1px dashed #2a2a3a', borderRadius: 14, padding: '2rem', textAlign: 'center' as const, color: '#8888a0', fontSize: '0.85rem' }}>No hay vacantes con ese filtro</div>
      )}

      <Modal show={modal?.type === 'generate'} onClose={() => { setModal(null); setGenResult(null) }} title={modal?.v ? modal.v.company + ' - ' + modal.v.role : 'Generar CV'}>
        {modal?.v && <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 10, padding: '0.75rem' }}>
              <div style={{ color: '#8888a0', fontSize: '0.7rem', marginBottom: '0.2rem' }}>Match</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.3rem', fontWeight: 700, color: mcolor(modal.v.matchScore || 0) }}>{modal.v.matchScore || 0}%</div>
            </div>
            <div style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 10, padding: '0.75rem' }}>
              <div style={{ color: '#8888a0', fontSize: '0.7rem', marginBottom: '0.2rem' }}>CV Base</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{CV_LABELS[modal.v.cvRecommendation?.cvBase] || 'General'}</div>
            </div>
          </div>
          {modal.v.cvRecommendation?.adapt && <div style={{ background: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.2)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem' }}><div style={{ color: '#ffaa00', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Adaptacion sugerida</div><div style={{ color: '#c8c8d8', fontSize: '0.8rem' }}>{modal.v.cvRecommendation.adapt}</div></div>}
          {!genResult && !genLoading && <button onClick={() => handleGenerate(modal.v)} style={{ width: '100%', background: 'linear-gradient(135deg,#00e87b,#00b862)', color: '#000', padding: '0.75rem', borderRadius: 10, fontSize: '0.9rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Generar CV Adaptado + Carta de Presentacion</button>}
          {genLoading && <div style={{ textAlign: 'center' as const, padding: '2rem', color: '#8888a0' }}><div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>...</div><div>Generando CV y carta de presentacion...</div><div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Esto toma ~10 segundos</div></div>}
          {genResult?.error && <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}><div style={{ color: '#ff4757', fontWeight: 600, marginBottom: '0.3rem' }}>Error al generar</div><div style={{ color: '#8888a0', fontSize: '0.8rem' }}>{genResult.error}</div></div>}
          {genResult?.success && <div>
            {genResult.suggestions?.length > 0 && <div style={{ background: 'rgba(59,139,255,0.08)', border: '1px solid rgba(59,139,255,0.2)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem' }}><div style={{ color: '#3b8bff', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>Sugerencias</div>{genResult.suggestions.map((s: string, i: number) => <div key={i} style={{ color: '#c8c8d8', fontSize: '0.8rem', marginBottom: '0.2rem' }}>- {s}</div>)}</div>}
            <div style={{ marginBottom: '1rem' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}><span style={{ color: '#00e87b', fontWeight: 600, fontSize: '0.85rem' }}>Carta de Presentacion</span><button onClick={() => copyText(genResult.coverLetter)} style={btnStyle('#2a2a3a', '#888', '#444')}>Copiar</button></div><div style={{ background: '#0d0d15', border: '1px solid #2a2a3a', borderRadius: 10, padding: '1rem', color: '#c8c8d8', fontSize: '0.82rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const }}>{genResult.coverLetter}</div></div>
            <div><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}><span style={{ color: '#a855f7', fontWeight: 600, fontSize: '0.85rem' }}>CV Adaptado ({CV_LABELS[genResult.cvBase] || 'General'})</span><button onClick={() => copyText(genResult.cvMarkdown)} style={btnStyle('#2a2a3a', '#888', '#444')}>Copiar</button></div><div style={{ background: '#0d0d15', border: '1px solid #2a2a3a', borderRadius: 10, padding: '1rem', color: '#c8c8d8', fontSize: '0.8rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' as const, maxHeight: '50vh', overflow: 'auto' }}>{genResult.cvMarkdown}</div></div>
          </div>}
        </div>}
      </Modal>

      <footer style={{ textAlign: 'center' as const, color: '#555570', fontSize: '0.7rem', paddingTop: '1.5rem', borderTop: '1px solid #2a2a3a' }}>JobHunter Pro - Powered by AutoClaw - Backend + IA integrados</footer>
    </div>
  )
}

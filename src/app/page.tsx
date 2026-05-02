\
'use client'

import { useEffect, useState } from 'react'

const DATA_URL = 'https://raw.githubusercontent.com/Federicohung/jobhunter-pro/main/data/panel.json'

const PIPELINE_STAGES = [
  { key: 'identificada', label: 'Identificadas', color: '#3b8bff', bg: 'rgba(59,139,255,0.15)' },
  { key: 'aplicada', label: 'Aplicadas', color: '#00e87b', bg: 'rgba(0,232,123,0.15)' },
  { key: 'entrevista', label: 'Entrevista', color: '#ff6b35', bg: 'rgba(255,107,53,0.15)' },
  { key: 'oferta', label: 'Oferta', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  { key: 'rechazada', label: 'Rechazadas', color: '#ff4757', bg: 'rgba(255,71,87,0.15)' },
]

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendiente', color: '#3b8bff', bg: 'rgba(59,139,255,0.15)' },
  applied: { label: 'Aplicada', color: '#00e87b', bg: 'rgba(0,232,123,0.15)' },
  entrevista: { label: 'Entrevista', color: '#ff6b35', bg: 'rgba(255,107,53,0.15)' },
  oferta: { label: 'Oferta', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  rechazada: { label: 'Rechazada', color: '#ff4757', bg: 'rgba(255,71,87,0.15)' },
}

function getMatchColor(score: number) {
  if (score >= 80) return '#00e87b'
  if (score >= 70) return '#ff6b35'
  if (score >= 60) return '#3b8bff'
  return '#8888a0'
}

function VacancyCard({ v, index }: { v: any; index: number }) {
  const st = STATUS_MAP[v.status] || STATUS_MAP.pending
  const mc = getMatchColor(v.matchScore || 0)
  const date = v.foundDate || v.appliedDate || ''
  return (
    <div style={{
      background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 14,
      padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap' as const, gap: '0.75rem'
    }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' as const }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.95rem' }}>{v.company}</span>
          <span style={{ background: mc + '20', color: mc, padding: '0.1rem 0.45rem', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700 }}>{v.matchScore || 0}%</span>
          <span style={{ background: st.bg, color: st.color, padding: '0.1rem 0.45rem', borderRadius: 20, fontSize: '0.65rem', fontWeight: 600 }}>{st.label}</span>
        </div>
        <div style={{ color: '#c8c8d8', fontSize: '0.82rem', fontWeight: 500 }}>{v.role}</div>
        <div style={{ color: '#8888a0', fontSize: '0.72rem', marginTop: '0.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
          <span>{v.location}</span>
          {date && <span>{date}</span>}
          {v.salary && <span style={{ color: '#00e87b' }}>{v.salary}</span>}
        </div>
        {v.notes && <div style={{ color: '#555570', fontSize: '0.7rem', marginTop: '0.3rem', lineHeight: 1.4 }}>{v.notes}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {v.searchUrl && (
          <a href={v.searchUrl} target="_blank" rel="noopener noreferrer"
            style={{ background: '#3b8bff', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
            Ver Oferta
          </a>
        )}
        {v.cvUsed && <span style={{ color: '#555570', fontSize: '0.65rem' }}>{v.cvUsed}</span>}
      </div>
    </div>
  )
}

export default function Home() {
  const [data, setData] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'applied'>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'match' | 'date'>('match')

  useEffect(() => {
    fetch(DATA_URL + '?t=' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
  }, [])

  const vacancies = data?.vacancies || []
  const apps = data?.applications || []

  const filteredVacancies = vacancies
    .filter((v: any) => {
      if (filter === 'pending') return v.status === 'pending'
      if (filter === 'applied') return v.status === 'applied'
      return true
    })
    .filter((v: any) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (v.company + v.role + v.location + (v.notes || '')).toLowerCase().includes(q)
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'match') return (b.matchScore || 0) - (a.matchScore || 0)
      return 0
    })

  const interviews = apps.filter((a: any) => a.status === 'entrevista').length

  const stats = [
    { label: 'Vacantes', value: vacancies.length, color: '#3b8bff', bg: 'rgba(59,139,255,0.15)' },
    { label: 'Aplicadas', value: apps.length, color: '#00e87b', bg: 'rgba(0,232,123,0.15)' },
    { label: 'Entrevistas', value: interviews, color: '#ff6b35', bg: 'rgba(255,107,53,0.15)' },
    { label: 'Match Avg', value: vacancies.length ? Math.round(vacancies.reduce((s: number, v: any) => s + (v.matchScore || 0), 0) / vacancies.length) + '%' : '-', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  ]

  const updatedStr = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid #2a2a3a', marginBottom: '2rem', flexWrap: 'wrap' as const, gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #00e87b, #00b862)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#000' }}>JP</div>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
              JobHunter <span style={{ color: '#00e87b' }}>Pro</span>
            </h1>
            <p style={{ color: '#8888a0', fontSize: '0.75rem' }}>{updatedStr || 'Actualizando...'}</p>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 14, padding: '1.25rem' }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ color: '#8888a0', fontSize: '0.8rem', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' as const, alignItems: 'center' }}>
        <input
          placeholder="Buscar empresa, rol, ubicacion..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 10, padding: '0.6rem 1rem', color: '#e8e8ef', fontSize: '0.85rem', outline: 'none' }}
        />
        {(['all', 'pending', 'applied'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? '#3b8bff' : '#12121a',
            border: '1px solid ' + (filter === f ? '#3b8bff' : '#2a2a3a'),
            borderRadius: 8, padding: '0.5rem 1rem', color: filter === f ? '#fff' : '#8888a0',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
          }}>
            {f === 'all' ? `Todas (${vacancies.length})` : f === 'pending' ? `Pendientes (${vacancies.filter((v: any) => v.status === 'pending').length})` : `Aplicadas (${apps.length})`}
          </button>
        ))}
        <button onClick={() => setSortBy(sortBy === 'match' ? 'date' : 'match')} style={{
          background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8, padding: '0.5rem 1rem',
          color: '#8888a0', fontSize: '0.8rem', cursor: 'pointer'
        }}>
          {sortBy === 'match' ? 'Match %' : 'Fecha'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '2rem' }}>
        {PIPELINE_STAGES.map((s, i) => {
          const count = i === 0 ? vacancies.filter((a: any) => a.status === 'pending').length : apps.filter((a: any) => a.status === s.key).length
          return (
            <div key={i} style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 10, padding: '0.75rem', textAlign: 'center' as const }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{count}</div>
              <div style={{ color: '#8888a0', fontSize: '0.65rem', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          )
        })}
      </div>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#8888a0' }}>
        {filteredVacancies.length} vacantes encontradas
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem', marginBottom: '3rem' }}>
        {filteredVacancies.length === 0 ? (
          <div style={{ background: '#12121a', border: '1px dashed #2a2a3a', borderRadius: 14, padding: '2rem', textAlign: 'center' as const, color: '#8888a0', fontSize: '0.85rem' }}>
            No hay vacantes con ese filtro
          </div>
        ) : (
          filteredVacancies.map((v: any, i: number) => <VacancyCard key={v.id || i} v={v} index={i} />)
        )}
      </div>

      <footer style={{ textAlign: 'center' as const, color: '#555570', fontSize: '0.7rem', paddingTop: '1.5rem', borderTop: '1px solid #2a2a3a' }}>
        JobHunter Pro - Powered by AutoClaw - Para marcar como aplicada: avisa por chat
      </footer>
    </div>
  )
}

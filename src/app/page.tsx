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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendiente', color: '#3b8bff', bg: 'rgba(59,139,255,0.15)' },
  applied: { label: 'Aplicada', color: '#00e87b', bg: 'rgba(0,232,123,0.15)' },
  entrevista: { label: 'Entrevista', color: '#ff6b35', bg: 'rgba(255,107,53,0.15)' },
  oferta: { label: 'Oferta', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  rechazada: { label: 'Rechazada', color: '#ff4757', bg: 'rgba(255,71,87,0.15)' },
}

export default function Home() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(DATA_URL + '?t=' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setData(null); setLoading(false) })
  }, [])

  const vacancies = data?.vacancies || []
  const apps = data?.applications || []
  const interviews = apps.filter((a: any) => a.status === 'entrevista').length
  const cvCount = data?.cvVersions ? Object.keys(data.cvVersions).length : 4

  const stats = [
    { icon: '📋', label: 'Vacantes', value: vacancies.length, color: '#3b8bff', bg: 'rgba(59,139,255,0.15)' },
    { icon: '✅', label: 'Aplicaciones', value: apps.length, color: '#00e87b', bg: 'rgba(0,232,123,0.15)' },
    { icon: '💬', label: 'Entrevistas', value: interviews, color: '#ff6b35', bg: 'rgba(255,107,53,0.15)' },
    { icon: '📄', label: 'CVs listos', value: cvCount, color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  ]

  const updatedStr = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''

  function getStatus(st: string) {
    return STATUS_CONFIG[st] || STATUS_CONFIG.pending
  }

  function getMatchColor(score: number) {
    if (score >= 80) return '#00e87b'
    if (score >= 70) return '#ff6b35'
    if (score >= 60) return '#3b8bff'
    return '#8888a0'
  }

  function VacancyCard(v: any, index: number) {
    const st = getStatus(v.status)
    const matchColor = getMatchColor(v.matchScore || 0)
    const date = v.foundDate || v.appliedDate || ''
    return (
      <div key={v.id || index} style={{
        background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 14,
        padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '0.75rem', transition: 'border-color 0.2s'
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem' }}>{v.company}</span>
            <span style={{
              background: ${matchColor}20, color: matchColor,
              padding: '0.15rem 0.5rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700
            }}>{v.matchScore || 0}%</span>
          </div>
          <div style={{ color: '#c8c8d8', fontSize: '0.85rem', fontWeight: 500 }}>{v.role}</div>
          <div style={{ color: '#8888a0', fontSize: '0.75rem', marginTop: '0.3rem', display: 'flex', gap: '1rem' }}>
            <span>📍 {v.location}</span>
            {date && <span>🗓 {date}</span>}
          </div>
          {v.notes && <div style={{ color: '#666680', fontSize: '0.75rem', marginTop: '0.5rem', lineHeight: 1.5 }}>{v.notes}</div>}
          {v.searchUrl && (
            <a href={v.searchUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: '#3b8bff', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-block', marginTop: '0.4rem' }}>
              🔗 Buscar en LinkedIn →
            </a>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span style={{ background: st.bg, color: st.color, padding: '0.3rem 0.8rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{st.label}</span>
          {v.cvUsed && <span style={{ color: '#666680', fontSize: '0.7rem' }}>📄 {v.cvUsed}</span>}
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '3rem', borderBottom: '1px solid #2a2a3a', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #00e87b, #00b862)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 700, color: '#000',
              boxShadow: '0 0 30px rgba(0,232,123,0.3)'
            }}>🦞</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
              JobHunter <span style={{ color: '#00e87b' }}>Pro</span>
            </h1>
          </div>
          <div style={{ textAlign: 'right', color: '#8888a0', fontSize: '0.85rem' }}>
            <div>{updatedStr || 'Actualizando...'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <div style={{ width: 8, height: 8, background: '#00e87b', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite' }} />
              <span>Sistema activo</span>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 16,
              padding: '1.5rem', transition: 'transform 0.2s, border-color 0.2s'
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = s.color }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.borderColor = '#2a2a3a' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '1rem' }}>{s.icon}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ color: '#8888a0', fontSize: '0.85rem', marginTop: '0.5rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pipeline */}
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Pipeline
          <div style={{ flex: 1, height: 1, background: '#2a2a3a' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {PIPELINE_STAGES.map((s, i) => {
            const vacCount = vacancies.filter((a: any) => a.status === 'pending' && i === 0).length
            const appCount = apps.filter((a: any) => a.status === s.key).length
            const count = i === 0 ? vacCount : appCount
            return (
              <div key={i} style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, color: s.color }}>{count}</div>
                <div style={{ color: '#8888a0', fontSize: '0.8rem', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            )
          })}
        </div>

        {/* Vacantes Pendientes */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            🔵 Vacantes Pendientes
            <span style={{ background: 'rgba(59,139,255,0.15)', color: '#3b8bff', padding: '0.15rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{vacancies.length}</span>
            <div style={{ flex: 1, height: 1, background: '#2a2a3a' }} />
          </div>
          {vacancies.length === 0 ? (
            <div style={{ background: '#12121a', border: '1px dashed #2a2a3a', borderRadius: 16, padding: '2rem', textAlign: 'center' }}>
              <div style={{ color: '#8888a0', fontSize: '0.85rem' }}>No hay vacantes pendientes. Pide a AutoClaw que busque con /buscar</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {vacancies.map((v: any, i: number) => VacancyCard(v, i))}
            </div>
          )}
        </div>

        {/* Aplicaciones */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            ✅ Aplicaciones Enviadas
            <span style={{ background: 'rgba(0,232,123,0.15)', color: '#00e87b', padding: '0.15rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{apps.length}</span>
            <div style={{ flex: 1, height: 1, background: '#2a2a3a' }} />
          </div>
          {apps.length === 0 ? (
            <div style={{ background: '#12121a', border: '1px dashed #2a2a3a', borderRadius: 16, padding: '2rem', textAlign: 'center' }}>
              <div style={{ color: '#8888a0', fontSize: '0.85rem' }}>Aun no has aplicado a ninguna oferta</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {apps.map((app: any, i: number) => VacancyCard(app, i))}
            </div>
          )}
        </div>

        {/* CV Versions */}
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          📄 Versiones de CV
          <span style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', padding: '0.15rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{cvCount}</span>
          <div style={{ flex: 1, height: 1, background: '#2a2a3a' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {data?.cvVersions && Object.entries(data.cvVersions).map(([key, cv]: [string, any], i: number) => {
            const colors = ['#00e87b', '#3b8bff', '#ff6b35', '#a855f7', '#ff4757']
            const icons = ['👔', '🎧', '⚙️', '💼', '🎯']
            const c = colors[i % colors.length]
            return (
              <div key={key} style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 14, padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: ${c}20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{icons[i % icons.length]}</div>
                <div>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.3rem' }}>{cv.label}</h3>
                  <p style={{ color: '#8888a0', fontSize: '0.8rem', lineHeight: 1.5 }}>{cv.target}</p>
                </div>
              </div>
            )
          })}
        </div>

        <footer style={{ textAlign: 'center', color: '#8888a0', fontSize: '0.75rem', paddingTop: '2rem', borderTop: '1px solid #2a2a3a', opacity: 0.5 }}>
          JobHunter Pro · Powered by AutoClaw · Datos actualizados via GitHub
        </footer>
      </div>

      <style jsx global>{
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: '#0a0a0f; color: '#e8e8ef; font-family: 'DM Sans', sans-serif; min-height: 100vh; }

        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,232,123,0.4); }
          50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(0,232,123,0); }
        }
      }</style>
    </>
  )
}

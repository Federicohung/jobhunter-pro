'use client'
import { useEffect, useState, useCallback } from 'react'

const PIPELINE = [
  { key: 'identificada', label: 'Identificadas', color: '#2563eb', bg: '#dbeafe' },
  { key: 'aplicada', label: 'Aplicadas', color: '#16a34a', bg: '#dcfce7' },
  { key: 'entrevista', label: 'Entrevista', color: '#ea580c', bg: '#ffedd5' },
  { key: 'oferta', label: 'Oferta', color: '#9333ea', bg: '#f3e8ff' },
  { key: 'rechazada', label: 'Rechazadas', color: '#dc2626', bg: '#fee2e2' },
]

const ST: Record<string, { l: string; c: string; bg: string }> = {
  pending: { l: 'Pendiente', c: '#2563eb', bg: '#dbeafe' },
  applied: { l: 'Aplicada', c: '#16a34a', bg: '#dcfce7' },
  skip: { l: 'Descartada', c: '#6b7280', bg: '#f3f4f6' },
  entrevista: { l: 'Entrevista', c: '#ea580c', bg: '#ffedd5' },
  oferta: { l: 'Oferta', c: '#9333ea', bg: '#f3e8ff' },
  rechazada: { l: 'Rechazada', c: '#dc2626', bg: '#fee2e2' },
}

const CV_LABELS: Record<string, string> = { general: 'General', csatc: 'Comercial / KAM', operations: 'Operaciones', accounts: 'Finanzas' }
function mc(s: number) { return s >= 80 ? '#16a34a' : s >= 70 ? '#ea580c' : s >= 60 ? '#2563eb' : '#6b7280' }

function Modal({ show, onClose, title, children }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!show) return null
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff',borderRadius:16,maxWidth:800,width:'100%',maxHeight:'90vh',overflow:'auto',padding:'1.5rem',boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem' }}>
          <h2 style={{ fontSize:'1.2rem',fontWeight:700,color:'#111827' }}>{title}</h2>
          <button onClick={onClose} style={{ background:'#f3f4f6',border:'none',color:'#374151',fontSize:'1.3rem',cursor:'pointer',borderRadius:8,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center' }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Home() {
  const [data,setData]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  const [filter,setFilter]=useState<'all'|'pending'|'applied'>('all')
  const [search,setSearch]=useState('')
  const [acting,setActing]=useState<string|null>(null)
  const [modal,setModal]=useState<{type:string;v:any}|null>(null)
  const [genLoading,setGenLoading]=useState(false)
  const [genResult,setGenResult]=useState<any>(null)
  const [toast,setToast]=useState<string|null>(null)

  const load=useCallback(async()=>{try{const r=await fetch('/api/panel');const d=await r.json();if(d.vacancies)setData(d)}catch{}setLoading(false)},[])
  useEffect(()=>{load()},[load])
  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(null),3000);return()=>clearTimeout(t)}},[toast])

  const vacs=data?.vacancies||[]
  const apps=data?.applications||[]
  const filtered=vacs.filter((v:any)=>filter==='all'||(filter==='pending'?v.status==='pending':v.status==='applied')).filter((v:any)=>{if(!search)return true;const q=search.toLowerCase();return(v.company+v.role+v.location+(v.notes||'')).toLowerCase().includes(q)}).sort((a:any,b:any)=>(b.matchScore||0)-(a.matchScore||0))
  const filteredApps=apps.filter((a:any)=>filter==='all'||filter==='applied').filter((a:any)=>{if(!search)return true;const q=search.toLowerCase();return(a.company+a.role+(a.notes||'')).toLowerCase().includes(q)})

  async function handleApply(v:any){setActing(String(v.id));try{await fetch('/api/apply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vacancyId:v.id,action:'apply'})});await load();setToast('Marcada como aplicada: '+v.company)}catch{setToast('Error')};setActing(null)}
  async function handleSkip(id:number){setActing(String(id));await fetch('/api/apply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vacancyId:id,action:'skip'})});await load();setToast('Descartada');setActing(null)}
  async function handleGenerate(v:any){setGenLoading(true);setGenResult(null);try{const r=await fetch('/api/generate-cv',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vacancyId:v.id})});const d=await r.json();if(d.success)setGenResult(d);else setGenResult({error:d.error})}catch{setGenResult({error:'connection_error'})};setGenLoading(false)}
  async function copyText(text:string){await navigator.clipboard.writeText(text);setToast('Copiado!')}

  const stats=[{label:'Vacantes',value:vacs.length,c:'#2563eb'},{label:'Aplicadas',value:apps.length,c:'#16a34a'},{label:'Match Prom',value:vacs.length?Math.round(vacs.reduce((s:number,v:any)=>s+(v.matchScore||0),0)/vacs.length)+'%':'-',c:'#9333ea'}]
  const updatedStr=data?.updatedAt?new Date(data.updatedAt).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):''

  if(loading)return<div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#f9fafb',color:'#374151',fontSize:'1.2rem'}}>Cargando vacantes...</div>

  return(
    <div style={{maxWidth:1100,margin:'0 auto',padding:'1.5rem',background:'#f9fafb',minHeight:'100vh',fontFamily:'system-ui,-apple-system,sans-serif'}}>

      {toast&&<div style={{position:'fixed',top:20,right:20,background:'#111827',color:'#fff',borderRadius:10,padding:'0.7rem 1.2rem',fontSize:'0.85rem',zIndex:2000,boxShadow:'0 4px 20px rgba(0,0,0,0.2)'}}>{toast}</div>}

      {/* Header */}
      <div style={{background:'#fff',borderRadius:16,padding:'1.25rem 1.5rem',marginBottom:'1rem',boxShadow:'0 1px 3px rgba(0,0,0,0.08)',display:'flex',alignItems:'center',gap:'1rem' }}>
        <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#16a34a,#15803d)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',fontWeight:800,color:'#fff' }}>JP</div>
        <div style={{flex:1}}>
          <h1 style={{fontSize:'1.4rem',fontWeight:800,color:'#111827',margin:0 }}>JobHunter <span style={{color:'#16a34a'}}>Pro</span></h1>
          <p style={{color:'#6b7280',fontSize:'0.75rem',margin:'0.15rem 0 0' }}>{updatedStr} &middot; {vacs.length} vacantes &middot; {apps.length} aplicadas</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem',marginBottom:'1rem' }}>
        {stats.map((s,i)=>(<div key={i} style={{background:'#fff',borderRadius:12,padding:'1rem',boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}><div style={{fontSize:'1.8rem',fontWeight:800,color:s.c}}>{s.value}</div><div style={{color:'#6b7280',fontSize:'0.8rem',marginTop:'0.15rem'}}>{s.label}</div></div>))}
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem',flexWrap:'wrap' as const,alignItems:'center' }}>
        <input placeholder='Buscar empresa, rol, ubicacion...' value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:200,background:'#fff',border:'1px solid #d1d5db',borderRadius:10,padding:'0.55rem 0.9rem',color:'#111827',fontSize:'0.85rem',outline:'none' }} />
        {(['all','pending','applied'] as const).map(f=>(<button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?'#111827':'#fff',color:filter===f?'#fff':'#374151',border:'1px solid '+(filter===f?'#111827':'#d1d5db'),borderRadius:8,padding:'0.45rem 0.9rem',fontSize:'0.8rem',fontWeight:600,cursor:'pointer' }}>{f==='all'?'Todas ('+vacs.length+')':f==='pending'?'Pendientes ('+vacs.filter((v:any)=>v.status==='pending').length+')':'Aplicadas ('+apps.length+')'}</button>))}
      </div>

      {/* Pipeline */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0.5rem',marginBottom:'1rem' }}>
        {PIPELINE.map((s,i)=>{const c=i===0?vacs.filter((a:any)=>a.status==='pending').length:apps.filter((a:any)=>a.status===s.key).length;return<div key={i} style={{background:s.bg,borderRadius:10,padding:'0.6rem',textAlign:'center' as const}}><div style={{fontSize:'1.3rem',fontWeight:800,color:s.color}}>{c}</div><div style={{color:s.color,fontSize:'0.6rem',marginTop:'0.1rem',textTransform:'uppercase',fontWeight:600,letterSpacing:'0.05em'}}>{s.label}</div></div>})}
      </div>

      {/* Vacancy Cards */}
      {filtered.length>0&&<>
        <div style={{fontSize:'0.85rem',fontWeight:600,color:'#6b7280',marginBottom:'0.5rem'}}>{filtered.length} vacantes pendientes</div>
        <div style={{display:'flex',flexDirection:'column' as const,gap:'0.5rem',marginBottom:'2rem' }}>
          {filtered.map((v:any,i:number)=>{
            const st=ST[v.status]||ST.pending;const color=mc(v.matchScore||0);const cvr=v.cvRecommendation||{};
            return(
              <div key={v.id||i} style={{background:'#fff',borderRadius:12,padding:'0.9rem 1.1rem',boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap' as const,gap:'0.5rem' }}>
                  <div style={{flex:1,minWidth:240 }}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.35rem',marginBottom:'0.25rem',flexWrap:'wrap' as const }}>
                      <span style={{fontWeight:700,fontSize:'0.92rem',color:'#111827'}}>{v.company}</span>
                      <span style={{background:color+'18',color,padding:'0.08rem 0.4rem',borderRadius:12,fontSize:'0.65rem',fontWeight:700}}>{v.matchScore||0}%</span>
                      <span style={{background:st.bg,color:st.c,padding:'0.08rem 0.4rem',borderRadius:12,fontSize:'0.65rem',fontWeight:600}}>{st.l}</span>
                      {v.needsCvVersion&&<span style={{background:'#fef3c7',color:'#d97706',padding:'0.08rem 0.4rem',borderRadius:12,fontSize:'0.6rem',fontWeight:600}}>CV</span>}
                    </div>
                    <div style={{color:'#1f2937',fontSize:'0.82rem',fontWeight:500}}>{v.role}</div>
                    <div style={{color:'#6b7280',fontSize:'0.72rem',marginTop:'0.2rem',display:'flex',gap:'0.6rem',flexWrap:'wrap' as const }}>
                      <span>{v.location}</span>
                      <span style={{color:'#9ca3af'}}>{CV_LABELS[cvr.cvBase]||'General'}</span>
                      {v.salary&&v.salary!=='No publicado'&&<span style={{color:'#16a34a',fontWeight:600}}>{v.salary}</span>}
                    </div>
                    {cvr.adapt&&<div style={{color:'#9ca3af',fontSize:'0.68rem',marginTop:'0.2rem'}}>{cvr.adapt}</div>}
                  </div>
                  <div style={{display:'flex',gap:'0.35rem',flexShrink:0,alignItems:'center',flexWrap:'wrap' as const }}>
                    {v.searchUrl&&<a href={v.searchUrl} target='_blank' rel='noopener noreferrer' style={{background:'#eff6ff',color:'#2563eb',padding:'0.35rem 0.7rem',borderRadius:8,fontSize:'0.7rem',fontWeight:600,textDecoration:'none',whiteSpace:'nowrap' as const}}>Ver Oferta</a>}
                    {v.status==='pending'&&<>
                      <button disabled={acting===String(v.id)} onClick={()=>handleApply(v)} style={{background:'#16a34a',color:'#fff',padding:'0.35rem 0.7rem',borderRadius:8,fontSize:'0.7rem',fontWeight:700,border:'none',cursor:'pointer',opacity:acting===String(v.id)?0.5:1}}>Ya Aplique</button>
                      <button disabled={acting===String(v.id)} onClick={()=>{setGenResult(null);setModal({type:'cv',v})}} style={{background:'#7c3aed',color:'#fff',padding:'0.35rem 0.7rem',borderRadius:8,fontSize:'0.7rem',fontWeight:600,border:'none',cursor:'pointer',opacity:acting===String(v.id)?0.5:1}}>Versionar CV</button>
                      <button disabled={acting===String(v.id)} onClick={()=>handleSkip(v.id)} style={{background:'#f3f4f6',color:'#6b7280',padding:'0.35rem 0.5rem',borderRadius:8,fontSize:'0.6rem',border:'1px solid #e5e7eb',cursor:'pointer',opacity:acting===String(v.id)?0.5:1}}>X</button>
                    </>}
                    {!v.status||v.status==='applied'?<button onClick={()=>{setGenResult(null);setModal({type:'cv',v})}} style={{background:'#f3e8ff',color:'#7c3aed',padding:'0.35rem 0.6rem',borderRadius:8,fontSize:'0.65rem',fontWeight:600,border:'none',cursor:'pointer'}}>Versionar CV</button>:null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </>}

      {/* Applications */}
      {filteredApps.length>0&&<>
        <div style={{fontSize:'0.85rem',fontWeight:600,color:'#16a34a',marginBottom:'0.5rem'}}>Aplicaciones enviadas ({apps.length})</div>
        <div style={{display:'flex',flexDirection:'column' as const,gap:'0.5rem',marginBottom:'2rem' }}>
          {filteredApps.map((a:any,i:number)=>{
            const st=ST[a.status]||ST.applied;return(
              <div key={a.id||i} style={{background:'#f0fdf4',borderRadius:12,padding:'0.9rem 1.1rem',border:'1px solid #bbf7d0' }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap' as const,gap:'0.5rem' }}>
                  <div style={{flex:1,minWidth:240 }}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.35rem',marginBottom:'0.25rem' }}>
                      <span style={{fontWeight:700,fontSize:'0.92rem',color:'#111827'}}>{a.company}</span>
                      <span style={{background:st.bg,color:st.c,padding:'0.08rem 0.4rem',borderRadius:12,fontSize:'0.65rem',fontWeight:600}}>{st.l}</span>
                      <span style={{background:mc(a.matchScore||0)+'18',color:mc(a.matchScore||0),padding:'0.08rem 0.4rem',borderRadius:12,fontSize:'0.65rem',fontWeight:700}}>{a.matchScore||0}%</span>
                    </div>
                    <div style={{color:'#1f2937',fontSize:'0.82rem',fontWeight:500}}>{a.role}</div>
                    <div style={{color:'#6b7280',fontSize:'0.72rem',marginTop:'0.2rem'}}>{a.location} &middot; {a.appliedDate||''}</div>
                  </div>
                  <div style={{display:'flex',gap:'0.35rem' }}>
                    {a.searchUrl&&<a href={a.searchUrl} target='_blank' rel='noopener noreferrer' style={{background:'#eff6ff',color:'#2563eb',padding:'0.35rem 0.6rem',borderRadius:8,fontSize:'0.65rem',textDecoration:'none',fontWeight:600}}>Ver Oferta</a>}
                    <button onClick={()=>{setGenResult(null);setModal({type:'cv',v:a})}} style={{background:'#f3e8ff',color:'#7c3aed',padding:'0.35rem 0.6rem',borderRadius:8,fontSize:'0.65rem',fontWeight:600,border:'none',cursor:'pointer'}}>Versionar CV</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </>}

      {filtered.length===0&&filteredApps.length===0&&<div style={{background:'#fff',borderRadius:12,padding:'2rem',textAlign:'center' as const,color:'#6b7280',fontSize:'0.85rem' }}>No hay vacantes con ese filtro</div>}

      {/* CV Modal */}
      <Modal show={modal?.type==='cv'} onClose={()=>{setModal(null);setGenResult(null)}} title={modal?.v?modal.v.company+' - '+modal.v.role:'Generar CV'}>
        {modal?.v&&<div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'1rem' }}>
            <div style={{background:'#f9fafb',borderRadius:10,padding:'0.7rem' }}><div style={{color:'#6b7280',fontSize:'0.7rem'}}>Match</div><div style={{fontSize:'1.3rem',fontWeight:800,color:mc(modal.v.matchScore||0)}}>{modal.v.matchScore||0}%</div></div>
            <div style={{background:'#f9fafb',borderRadius:10,padding:'0.7rem' }}><div style={{color:'#6b7280',fontSize:'0.7rem'}}>CV Base</div><div style={{fontSize:'0.9rem',fontWeight:600,color:'#111827'}}>{CV_LABELS[modal.v.cvRecommendation?.cvBase]||'General'}</div></div>
          </div>
          {modal.v.cvRecommendation?.adapt&&<div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'0.7rem',marginBottom:'1rem' }}><div style={{color:'#d97706',fontSize:'0.75rem',fontWeight:600,marginBottom:'0.15rem'}}>Adaptacion sugerida</div><div style={{color:'#374151',fontSize:'0.8rem'}}>{modal.v.cvRecommendation.adapt}</div></div>}
          {!genResult&&!genLoading&&<button onClick={()=>handleGenerate(modal.v)} style={{width:'100%',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'#fff',padding:'0.7rem',borderRadius:10,fontSize:'0.9rem',fontWeight:700,border:'none',cursor:'pointer'}}>Generar CV Adaptado + Carta de Presentacion</button>}
          {genLoading&&<div style={{textAlign:'center' as const,padding:'2rem',color:'#6b7280' }}><div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>Generando...</div><div style={{fontSize:'0.8rem'}}>Esto toma ~10 segundos</div></div>}
          {genResult?.error&&<div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'1rem',marginBottom:'1rem' }}><div style={{color:'#dc2626',fontWeight:600,marginBottom:'0.2rem'}}>Error</div><div style={{color:'#6b7280',fontSize:'0.8rem'}}>{genResult.error}</div></div>}
          {genResult?.success&&<div>
            {genResult.suggestions?.length>0&&<div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:10,padding:'0.7rem',marginBottom:'1rem' }}><div style={{color:'#2563eb',fontSize:'0.75rem',fontWeight:600,marginBottom:'0.2rem'}}>Sugerencias</div>{genResult.suggestions.map((s:string,i:number)=><div key={i} style={{color:'#374151',fontSize:'0.8rem',marginBottom:'0.1rem'}}>- {s}</div>)}</div>}
            <div style={{marginBottom:'1rem' }}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.4rem' }}><span style={{color:'#16a34a',fontWeight:700,fontSize:'0.85rem'}}>Carta de Presentacion</span><button onClick={()=>copyText(genResult.coverLetter)} style={{background:'#f3f4f6',color:'#374151',padding:'0.2rem 0.5rem',borderRadius:6,fontSize:'0.7rem',border:'1px solid #d1d5db',cursor:'pointer'}}>Copiar</button></div><div style={{background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:10,padding:'1rem',color:'#1f2937',fontSize:'0.82rem',lineHeight:1.6,whiteSpace:'pre-wrap' as const}}>{genResult.coverLetter}</div></div>
            <div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.4rem' }}><span style={{color:'#7c3aed',fontWeight:700,fontSize:'0.85rem'}}>CV Adaptado ({CV_LABELS[genResult.cvBase]||'General'})</span><button onClick={()=>copyText(genResult.cvMarkdown)} style={{background:'#f3f4f6',color:'#374151',padding:'0.2rem 0.5rem',borderRadius:6,fontSize:'0.7rem',border:'1px solid #d1d5db',cursor:'pointer'}}>Copiar</button></div><div style={{background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:10,padding:'1rem',color:'#1f2937',fontSize:'0.8rem',lineHeight:1.5,whiteSpace:'pre-wrap' as const,maxHeight:'50vh',overflow:'auto'}}>{genResult.cvMarkdown}</div></div>
          </div>}
        </div>}
      </Modal>

      <div style={{textAlign:'center' as const,color:'#9ca3af',fontSize:'0.7rem',paddingTop:'1.5rem'}}>JobHunter Pro &middot; Powered by AutoClaw</div>
    </div>
  )
}

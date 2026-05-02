<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>JobHunter Pro — Panel</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0a0a0f;
      --surface: #12121a;
      --surface2: #1a1a26;
      --border: #2a2a3a;
      --text: #e8e8ef;
      --text-dim: #8888a0;
      --accent: #00e87b;
      --accent-dim: rgba(0, 232, 123, 0.15);
      --orange: #ff6b35;
      --orange-dim: rgba(255, 107, 53, 0.15);
      --blue: #3b8bff;
      --blue-dim: rgba(59, 139, 255, 0.15);
      --red: #ff4757;
      --red-dim: rgba(255, 71, 87, 0.15);
      --yellow: #ffc312;
      --yellow-dim: rgba(255, 195, 18, 0.15);
      --purple: #a855f7;
      --purple-dim: rgba(168, 85, 247, 0.15);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Noise overlay */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9999;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem;
    }

    /* Header */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 0 3rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 3rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--accent), #00b862);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      color: #000;
      box-shadow: 0 0 30px rgba(0, 232, 123, 0.3);
    }

    .logo h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.03em;
    }

    .logo h1 span {
      color: var(--accent);
    }

    .header-meta {
      text-align: right;
      color: var(--text-dim);
      font-size: 0.85rem;
    }

    .header-meta .status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 0.25rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: var(--accent);
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,232,123,0.4); }
      50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(0,232,123,0); }
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s, border-color 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      border-color: var(--accent);
    }

    .stat-card .icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .stat-card .value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2.2rem;
      font-weight: 700;
      line-height: 1;
    }

    .stat-card .label {
      color: var(--text-dim);
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .stat-green .icon { background: var(--accent-dim); }
    .stat-green .value { color: var(--accent); }

    .stat-blue .icon { background: var(--blue-dim); }
    .stat-blue .value { color: var(--blue); }

    .stat-orange .icon { background: var(--orange-dim); }
    .stat-orange .value { color: var(--orange); }

    .stat-purple .icon { background: var(--purple-dim); }
    .stat-purple .value { color: var(--purple); }

    /* Sections */
    .section-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    /* CV Versions */
    .cv-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .cv-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      transition: border-color 0.2s;
    }

    .cv-card:hover {
      border-color: var(--accent);
    }

    .cv-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }

    .cv-card h3 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      margin-bottom: 0.3rem;
    }

    .cv-card p {
      color: var(--text-dim);
      font-size: 0.8rem;
      line-height: 1.5;
    }

    /* Applications Table */
    .applications-section {
      margin-bottom: 3rem;
    }

    .empty-state {
      background: var(--surface);
      border: 1px dashed var(--border);
      border-radius: 16px;
      padding: 3rem;
      text-align: center;
    }

    .empty-state .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.3;
    }

    .empty-state h3 {
      font-family: 'Space Grotesk', sans-serif;
      color: var(--text-dim);
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--text-dim);
      font-size: 0.85rem;
      opacity: 0.7;
    }

    /* Pipeline */
    .pipeline {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .pipeline-stage {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.25rem;
      text-align: center;
    }

    .pipeline-stage .count {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2rem;
      font-weight: 700;
    }

    .pipeline-stage .stage-name {
      color: var(--text-dim);
      font-size: 0.8rem;
      margin-top: 0.3rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    /* Footer */
    footer {
      text-align: center;
      color: var(--text-dim);
      font-size: 0.75rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border);
      opacity: 0.5;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .container { padding: 1rem; }
      header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .header-meta { text-align: left; }
      .header-meta .status { justify-content: flex-start; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    /* Loading animation */
    .fade-in {
      animation: fadeIn 0.6s ease-out both;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fade-in:nth-child(1) { animation-delay: 0.05s; }
    .fade-in:nth-child(2) { animation-delay: 0.1s; }
    .fade-in:nth-child(3) { animation-delay: 0.15s; }
    .fade-in:nth-child(4) { animation-delay: 0.2s; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">
        <div class="logo-icon">🦞</div>
        <h1>JobHunter <span>Pro</span></h1>
      </div>
      <div class="header-meta">
        <div id="last-update">Actualizando...</div>
        <div class="status">
          <div class="status-dot"></div>
          <span>Sistema activo</span>
        </div>
      </div>
    </header>

    <!-- Stats -->
    <div class="stats-grid" id="stats-grid">
      <!-- Populated by JS -->
    </div>

    <!-- Pipeline -->
    <div class="section-title">Pipeline</div>
    <div class="pipeline" id="pipeline">
      <!-- Populated by JS -->
    </div>

    <!-- CV Versions -->
    <div class="section-title">Versiones de CV</div>
    <div class="cv-grid" id="cv-grid">
      <!-- Populated by JS -->
    </div>

    <!-- Applications -->
    <div class="applications-section">
      <div class="section-title">Aplicaciones</div>
      <div id="applications">
        <!-- Populated by JS -->
      </div>
    </div>

    <footer>
      JobHunter Pro · Powered by AutoClaw · Datos actualizados vía GitHub
    </footer>
  </div>

  <script>
    const DATA_URL = 'https://raw.githubusercontent.com/Federicohung/jobhunter-pro/main/data/panel.json';

    const PIPELINE_STAGES = [
      { key: 'identificada', label: 'Identificadas', color: 'var(--blue)', bg: 'var(--blue-dim)' },
      { key: 'aplicada', label: 'Aplicadas', color: 'var(--accent)', bg: 'var(--accent-dim)' },
      { key: 'entrevista', label: 'Entrevista', color: 'var(--orange)', bg: 'var(--orange-dim)' },
      { key: 'oferta', label: 'Oferta', color: 'var(--purple)', bg: 'var(--purple-dim)' },
      { key: 'rechazada', label: 'Rechazadas', color: 'var(--red)', bg: 'var(--red-dim)' },
    ];

    const CV_VERSIONS = [
      { key: 'general', icon: '👤', label: 'Perfil General', target: 'Dirección, management, rol integral', color: 'var(--accent)', bg: 'var(--accent-dim)' },
      { key: 'csatc', icon: '🎧', label: 'CSATC / Customer Support', target: 'Atención al cliente, soporte', color: 'var(--blue)', bg: 'var(--blue-dim)' },
      { key: 'operations', icon: '⚙️', label: 'Operaciones', target: 'Logistics, service delivery', color: 'var(--orange)', bg: 'var(--orange-dim)' },
      { key: 'accounts', icon: '💼', label: 'Cuentas / Ventas B2B', target: 'Key Account Manager, B2B sales', color: 'var(--purple)', bg: 'var(--purple-dim)' },
    ];

    async function loadData() {
      try {
        const res = await fetch(DATA_URL + '?t=' + Date.now());
        if (!res.ok) throw new Error('Not found');
        return await res.json();
      } catch (e) {
        return { applications: [], stats: { totalApplications: 0, interviews: 0, followUps: 0 }, updatedAt: new Date().toISOString() };
      }
    }

    function renderStats(data) {
      const grid = document.getElementById('stats-grid');
      const apps = data.applications || [];
      const interviews = apps.filter(a => a.status === 'entrevista').length;
      const offers = apps.filter(a => a.status === 'oferta').length;

      const stats = [
        { icon: '📊', label: 'Aplicaciones', value: apps.length, cls: 'stat-green' },
        { icon: '🎯', label: 'Entrevistas', value: interviews, cls: 'stat-blue' },
        { icon: '🔥', label: 'Ofertas', value: offers, cls: 'stat-orange' },
        { icon: '📋', label: 'CVs listos', value: '4', cls: 'stat-purple' },
      ];

      grid.innerHTML = stats.map(s => `
        <div class="stat-card ${s.cls} fade-in">
          <div class="icon">${s.icon}</div>
          <div class="value">${s.value}</div>
          <div class="label">${s.label}</div>
        </div>
      `).join('');
    }

    function renderPipeline(data) {
      const pipeline = document.getElementById('pipeline');
      const apps = data.applications || [];

      pipeline.innerHTML = PIPELINE_STAGES.map(s => {
        const count = apps.filter(a => a.status === s.key).length;
        return `
          <div class="pipeline-stage fade-in">
            <div class="count" style="color: ${s.color}">${count}</div>
            <div class="stage-name">${s.label}</div>
          </div>
        `;
      }).join('');
    }

    function renderCVs() {
      const grid = document.getElementById('cv-grid');
      grid.innerHTML = CV_VERSIONS.map(cv => `
        <div class="cv-card fade-in">
          <div class="cv-icon" style="background: ${cv.bg}">${cv.icon}</div>
          <div>
            <h3>${cv.label}</h3>
            <p>${cv.target}</p>
          </div>
        </div>
      `).join('');
    }

    function renderApplications(data) {
      const container = document.getElementById('applications');
      const apps = data.applications || [];

      if (apps.length === 0) {
        container.innerHTML = `
          <div class="empty-state fade-in">
            <div class="empty-icon">🔍</div>
            <h3>Sin aplicaciones aún</h3>
            <p>Usa /buscar [rol] en el chat de AutoClaw para empezar</p>
          </div>
        `;
        return;
      }

      let html = '<div style="display:flex;flex-direction:column;gap:0.75rem">';
      apps.forEach(app => {
        const stage = PIPELINE_STAGES.find(s => s.key === app.status) || PIPELINE_STAGES[0];
        const date = app.date ? new Date(app.date).toLocaleDateString('es-ES') : '';
        html += `
          <div class="stat-card fade-in" style="display:flex;justify-content:space-between;align-items:center;padding:1rem 1.25rem">
            <div>
              <div style="font-weight:600;font-size:0.95rem">${app.company || 'Empresa'}</div>
              <div style="color:var(--text-dim);font-size:0.8rem;margin-top:0.2rem">${app.role || 'Rol'}</div>
            </div>
            <div style="display:flex;align-items:center;gap:1rem">
              <span style="color:var(--text-dim);font-size:0.75rem">${date}</span>
              <span style="background:${stage.bg};color:${stage.color};padding:0.25rem 0.75rem;border-radius:20px;font-size:0.75rem;font-weight:600">${stage.label}</span>
            </div>
          </div>
        `;
      });
      html += '</div>';
      container.innerHTML = html;
    }

    function renderUpdateDate(data) {
      const el = document.getElementById('last-update');
      if (data.updatedAt) {
        const d = new Date(data.updatedAt);
        el.textContent = 'Actualizado: ' + d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    }

    async function init() {
      const data = await loadData();
      renderStats(data);
      renderPipeline(data);
      renderCVs();
      renderApplications(data);
      renderUpdateDate(data);
    }

    init();
  </script>
</body>
</html>

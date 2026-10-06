/**
 * TOP BAR COMPONENT
 * Tugas Grafika Komputer - Polindra Campus 2D
 * -------------------------------------------------------------
 * Menyediakan markup template literal untuk header aplikasi.
 */

export function renderTopBar() {
  return `
    <header class="top-bar glass-panel" id="top-bar">
      <div class="brand-section">
        <div class="brand-badge" title="Politeknik Negeri Indramayu">P</div>
        <div class="brand-titles">
          <h1 class="main-title">
            Tugas Grafika Komputer - Polindra
            <span class="badge-tag">Orthographic 2D</span>
          </h1>
          <span class="sub-title">Visualisasi Geometris Kampus &amp; Transformasi Grafika</span>
        </div>
      </div>

      <div class="top-bar-stats">
        <div class="status-pill">
          <span class="pulse-dot"></span>
          <span>WebGL Active</span>
        </div>
        <div class="mode-indicator" id="coords-indicator">X: 0 | Y: 0</div>
        <button class="tool-btn" id="theme-toggle" data-tooltip="Ganti Tema (Light/Dark)" title="Ganti Tema (Light / Dark)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>
        <button id="btn-toggle-top-bar" class="panel-collapse-btn" title="Sembunyikan Top Bar (Lipat ke Atas)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </button>
      </div>
    </header>
  `;
}

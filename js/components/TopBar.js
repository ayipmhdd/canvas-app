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
        <button id="btn-toggle-top-bar" class="panel-collapse-btn" title="Sembunyikan Top Bar (Lipat ke Atas)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </button>
      </div>
    </header>
  `;
}

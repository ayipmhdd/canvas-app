/**
 * RIGHT TOOLBAR COMPONENT
 * Tugas Grafika Komputer - Polindra Campus 2D
 * -------------------------------------------------------------
 * Menyediakan markup template literal untuk toolbar vertikal desain,
 * termasuk alat Seleksi, Hand Tool, Shape Generator, dan Color Picker.
 */

export function renderRightToolbar() {
  return `
    <div class="right-toolbar glass-panel" id="right-toolbar">
      <!-- 1. Selection & Hand Tools -->
      <button class="tool-btn active" id="tool-select" data-tooltip="Kursor Seleksi (V)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path></svg>
      </button>
      <button class="tool-btn" id="tool-pan" data-tooltip="Alat Geser (Hand Tool - H / Space)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 11V6a2 2 0 0 0-4 0v5"></path><path d="M14 10V4a2 2 0 0 0-4 0v6"></path><path d="M10 10.5V6a2 2 0 0 0-4 0v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>
      </button>

      <div class="toolbar-divider"></div>

      <!-- 2. Shape Generator & Color Fill Tools -->
      <button class="tool-btn" id="tool-shape" data-tooltip="Bentuk Geometri (Shapes)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
      </button>
      <button class="tool-btn" id="tool-color" data-tooltip="Warna Objek (Color Fill)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a10 10 0 0 1 10 10c0 3-2 5-5 5h-1a2 2 0 0 0-2 2c0 1.5-1 3-2 3a10 10 0 0 1-10-10A10 10 0 0 1 12 2z"></path><circle cx="7.5" cy="10" r="1.5" fill="currentColor"></circle><circle cx="12" cy="6.5" r="1.5" fill="currentColor"></circle><circle cx="16.5" cy="10" r="1.5" fill="currentColor"></circle><circle cx="15.5" cy="14" r="1.5" fill="currentColor"></circle></svg>
      </button>

      <div class="toolbar-divider"></div>

      <!-- 3. Zoom Navigation Controls -->
      <button class="tool-btn" id="tool-zoom-in" data-tooltip="Perbesar Zoom (+)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
      </button>
      <button class="tool-btn" id="tool-zoom-out" data-tooltip="Perkecil Zoom (-)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
      </button>
      
      <div class="toolbar-divider"></div>

      <!-- 4. Utility Controls -->
      <button class="tool-btn" id="tool-animate" data-tooltip="Animasi Rotasi (Play/Pause)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" id="play-pause-icon"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      </button>
      <button class="tool-btn" id="tool-reset" data-tooltip="Reset Pandangan (100%)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
      </button>
      <button class="tool-btn" id="tool-grid" data-tooltip="Sembunyikan / Tampilkan Titik Grid">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
      </button>
      <button class="tool-btn" id="tool-export" data-tooltip="Export Gambar (PNG)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      </button>
    </div>
  `;
}

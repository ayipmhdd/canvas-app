/**
 * BOTTOM BAR COMPONENT
 * Tugas Grafika Komputer - Polindra Campus 2D
 * -------------------------------------------------------------
 * Menyediakan markup template literal untuk Transformation Inspector bar.
 */

export function renderBottomBar() {
  return `
    <footer class="bottom-bar-container">
      <div class="bottom-bar glass-panel" id="bottom-bar">
        <div class="transform-header">
          <div class="transform-badge-label">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>Status Grafika:</span>
            <span class="active-target-name" id="selected-object-badge">Gedung Utama (PlaneGeometry)</span>
          </div>
          <div class="transform-desc">
            Transformasi diterapkan: <strong>Translasi (x,y)</strong>, <strong>Rotasi (sumbu z)</strong>, <strong>Scaling</strong>
          </div>
        </div>

        <div class="transform-controls-row">
          <!-- Translasi X -->
          <div class="control-group" title="Translasi Sumbu X (Posisi Horizontal)">
            <span class="control-label">PosX</span>
            <input type="number" class="control-input" id="input-pos-x" step="5">
            <input type="range" class="slider-compact" id="slider-pos-x" min="-400" max="400" step="2">
          </div>

          <!-- Translasi Y -->
          <div class="control-group" title="Translasi Sumbu Y (Posisi Vertikal)">
            <span class="control-label">PosY</span>
            <input type="number" class="control-input" id="input-pos-y" step="5">
            <input type="range" class="slider-compact" id="slider-pos-y" min="-300" max="300" step="2">
          </div>

          <!-- Rotasi Z -->
          <div class="control-group" title="Rotasi Sudut Sumbu Z (Derajat)">
            <span class="control-label">RotZ°</span>
            <input type="number" class="control-input" id="input-rot-z" step="1">
            <input type="range" class="slider-compact" id="slider-rot-z" min="-180" max="180" step="1">
          </div>

          <!-- Skala -->
          <div class="control-group" title="Penskalaan Seragam (Scaling)">
            <span class="control-label">Scale</span>
            <input type="number" class="control-input" id="input-scale" step="0.1" min="0.2" max="3">
            <input type="range" class="slider-compact" id="slider-scale" min="0.2" max="2.5" step="0.05">
          </div>
        </div>
      </div>
    </footer>
  `;
}

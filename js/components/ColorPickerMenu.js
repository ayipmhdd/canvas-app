/**
 * COLOR PICKER MENU COMPONENT
 * Tugas Grafika Komputer - Polindra Campus 2D
 * -------------------------------------------------------------
 * Menyediakan popover menu bertema terang (Stitch Light Mode) untuk
 * mengubah warna material objek Three.js yang sedang dipilih.
 */

export function renderColorPickerMenu() {
  const swatches = [
    // Baris 1: Polindra & Sky Blues
    '#0F4C81', '#0284C7', '#3B82F6', '#60A5FA', '#93C5FD', '#06B6D4',
    // Baris 2: Warm Amber & Reds
    '#F59E0B', '#FBBF24', '#FDE047', '#EF4444', '#F43F5E', '#FB7185',
    // Baris 3: Emerald, Purples & Pinks
    '#10B981', '#059669', '#8B5CF6', '#A855F7', '#EC4899', '#78350F',
    // Baris 4: Slate Neutrals & Monochrome
    '#0F172A', '#1E293B', '#475569', '#94A3B8', '#CBD5E1', '#FFFFFF'
  ];

  const swatchesHTML = swatches.map(color => `
    <button class="color-swatch" data-color="${color}" style="background-color: ${color};" title="${color}"></button>
  `).join('');

  return `
    <div id="color-picker-popover" class="popover-menu popover-color glass-panel hidden">
      <!-- Header Popover -->
      <div class="color-popover-header">
        <span class="color-popover-title">Custom Fill</span>
        <button id="close-color-picker" class="popover-close-btn" title="Tutup Menu">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Color Canvas / Spectrum Area -->
      <div class="color-preview-container">
        <div id="color-preview-box" class="color-preview-box" style="background-color: #0284C7;" title="Klik untuk membuka color picker sistem">
          <input type="color" id="native-color-picker" value="#0284C7" class="native-color-input">
          <span class="color-picker-hint">Pilih Warna</span>
        </div>
      </div>

      <!-- Sliders Row (Eyedropper & Hue Slider) -->
      <div class="color-sliders-row">
        <div class="eyedropper-icon" title="Color Picker">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <input type="range" id="hue-slider" class="hue-slider" min="0" max="360" value="200" title="Geser Spektrum Warna">
      </div>

      <!-- Hex & Alpha Input Row -->
      <div class="color-inputs-row">
        <div class="color-format-badge">Hex</div>
        <div class="hex-input-wrapper">
          <span class="hash-symbol">#</span>
          <input type="text" id="hex-color-input" class="hex-text-input" value="0284C7" maxlength="7" spellcheck="false">
        </div>
        <div class="opacity-badge">100%</div>
      </div>

      <!-- Swatches Section (On this page) -->
      <div class="swatches-section">
        <div class="swatches-header">
          <span>Palet Warna Kampus</span>
          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div class="swatches-grid">
          ${swatchesHTML}
        </div>
      </div>
    </div>
  `;
}

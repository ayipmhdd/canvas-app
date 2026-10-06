/**
 * SHAPE GENERATOR MENU COMPONENT
 * Tugas Grafika Komputer - Polindra Campus 2D
 * -------------------------------------------------------------
 * Menyediakan popover menu bertema terang (Stitch Light Mode) horizontal
 * dengan tombol ikon saja (tanpa label teks) untuk membuat bentuk geometri 2D.
 */

export function renderShapeMenu() {
  return `
    <div id="shape-menu-popover" class="popover-menu popover-shape glass-panel hidden">
      <button class="tool-btn" data-shape="rectangle" data-tooltip="Rectangle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="16" rx="2"></rect>
        </svg>
      </button>

      <button class="tool-btn" data-shape="line" data-tooltip="Line">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="19" x2="19" y2="5"></line>
        </svg>
      </button>

      <button class="tool-btn" data-shape="arrow" data-tooltip="Arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="19" x2="19" y2="5"></line>
          <polyline points="9 5 19 5 19 15"></polyline>
        </svg>
      </button>

      <button class="tool-btn" data-shape="ellipse" data-tooltip="Circle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9"></circle>
        </svg>
      </button>

      <button class="tool-btn" data-shape="triangle" data-tooltip="Triangle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3L2 21h20L12 3z"></path>
        </svg>
      </button>

      <button class="tool-btn" data-shape="star" data-tooltip="Star">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </button>
    </div>
  `;
}

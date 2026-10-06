/**
 * TOAST NOTIFICATION COMPONENT
 * Tugas Grafika Komputer - Polindra Campus 2D
 * -------------------------------------------------------------
 * Menyediakan markup template literal untuk toast notifikasi pop-up.
 */

export function renderToast() {
  return `
    <div id="toast">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span id="toast-msg">Pesan</span>
    </div>
  `;
}

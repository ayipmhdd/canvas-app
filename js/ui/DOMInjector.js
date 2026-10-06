/**
 * DOM INJECTOR UTILITY MODULE
 * Tugas Grafika Komputer - Polindra Campus 2D
 * -------------------------------------------------------------
 * Mengimpor seluruh komponen UI berbasis template literal dan menginjeksinya
 * ke dalam mounting root DOM secara sinkron sebelum controller diinisialisasi.
 */

import { renderTopBar } from '../components/TopBar.js';
import { renderLeftSidebar } from '../components/LeftSidebar.js';
import { renderRightToolbar } from '../components/RightToolbar.js';
import { renderShapeMenu } from '../components/ShapeMenu.js';
import { renderColorPickerMenu } from '../components/ColorPickerMenu.js';
import { renderBottomBar } from '../components/BottomBar.js';
import { renderToast } from '../components/Toast.js';

export function injectDOM() {
  // 1. Injeksi Komponen Utama ke dalam Overlay Grid
  const overlay = document.getElementById('ui-overlay') || document.querySelector('.ui-overlay');
  if (overlay) {
    overlay.innerHTML = `
      ${renderTopBar()}
      <main class="workspace-body">
        ${renderLeftSidebar()}
        ${renderRightToolbar()}
        ${renderShapeMenu()}
        ${renderColorPickerMenu()}
      </main>
      ${renderBottomBar()}
    `;
  } else {
    console.error("Mounting root '.ui-overlay' tidak ditemukan di DOM.");
  }

  // 2. Injeksi Floating Reopen Buttons langsung ke document.body
  if (!document.getElementById('btn-reopen-top-bar')) {
    document.body.insertAdjacentHTML('beforeend', `
      <button id="btn-reopen-top-bar" class="floating-edge-btn floating-edge-top" title="Tampilkan Top Bar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
        <span>Buka Top Bar</span>
      </button>
      <button id="btn-reopen-left-sidebar" class="floating-edge-btn floating-edge-left" title="Tampilkan Sidebar Layer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        <span>Buka Layers</span>
      </button>
    `);
  }

  // 2. Injeksi Komponen Toast Notifikasi
  const toastMount = document.getElementById('toast-mount');
  if (toastMount) {
    toastMount.outerHTML = renderToast();
  } else if (!document.getElementById('toast')) {
    document.body.insertAdjacentHTML('beforeend', renderToast());
  }
}

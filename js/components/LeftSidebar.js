/**
 * LEFT SIDEBAR COMPONENT
 * Tugas Grafika Komputer - Polindra Campus 2D
 * -------------------------------------------------------------
 * Menyediakan markup template literal untuk kartu identitas mahasiswa
 * dan kontainer daftar layer objek grafika.
 */

export function renderLeftSidebar() {
  return `
    <aside class="left-sidebar glass-panel" id="left-sidebar">
      <!-- Student Information Card -->
      <div class="sidebar-section">
        <div class="section-title">
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Identitas Mahasiswa</span>
          </div>
          <button id="btn-toggle-left-sidebar" class="panel-collapse-btn" title="Sembunyikan Sidebar (Lipat ke Kiri)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
        </div>
        <div class="student-card">
          <div class="meta-row">
            <span class="meta-label">Nama:</span>
            <span class="meta-value editable" contenteditable="true" spellcheck="false" title="Klik untuk mengedit nama">Ayip Muhammad</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">NIM:</span>
            <span class="meta-value editable" contenteditable="true" spellcheck="false" title="Klik untuk mengedit NIM">2305059</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Kampus:</span>
            <span class="meta-value">POLINDRA</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Matkul:</span>
            <span class="meta-value">Grafika Komputer</span>
          </div>
        </div>
      </div>

      <!-- Layers / Object List Section -->
      <div class="sidebar-section" style="padding-bottom: 6px;">
        <div class="section-title">
          <span>Daftar Objek Scene</span>
          <span style="font-size: 10px; font-weight: normal; color: var(--text-subtle);">Pilih objek</span>
        </div>
      </div>

      <div class="layers-container" id="layers-list">
        <!-- Dynamically populated layers by UIController -->
      </div>
    </aside>
  `;
}

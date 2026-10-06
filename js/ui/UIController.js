/**
 * UI CONTROLLER MODULE
 * Tugas Grafika Komputer - Polindra Campus 2D
 * -------------------------------------------------------------
 * Mengelola semua interaksi DOM antarmuka pengguna:
 *   - Sidebar kiri: Daftar Layer & Toggle Visibilitas Objek
 *   - Toolbar kanan: Navigasi Pan (Hand Tool), Zoom In/Out, Export PNG, Play/Pause Animasi, Grid
 *   - Bottom bar: Live Inspector Transformasi (Translasi, Rotasi, Skala)
 *   - Keyboard shortcuts: Spacebar untuk temporary pan tool ala Figma
 *   - Toast Notifikasi & Pelacak Koordinat Kursor
 */

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class UIController {
  constructor() {
    this.threeScene = null;
    this.sceneObjects = [];
    this.selectedObjectEntry = null;
    this.gridVisible = true;
    this.isAnimating = true;
    this.onToggleAnimationCallback = null;
  }

  /**
   * Inisialisasi controller dengan referensi ke ThreeScene dan callback animasi
   */
  init({ threeScene, onToggleAnimation, isAnimating = true }) {
    this.threeScene = threeScene;
    this.onToggleAnimationCallback = onToggleAnimation;
    this.isAnimating = isAnimating;

    // Hubungkan ThreeScene dengan UIController dan sinkronkan referensi sceneObjects
    this.threeScene.uiController = this;
    this.threeScene.sceneObjects = this.sceneObjects;

    // Callback saat objek dipilih, dibatalkan, atau digeser langsung pada canvas
    this.threeScene.onObjectSelected = (entry) => {
      this.selectObject(entry, false);
    };

    this.threeScene.onObjectDeselected = () => {
      this.deselectObject(false);
    };

    this.threeScene.onObjectTransformed = (entry) => {
      this.updateInspectorUI(entry);
    };

    this.setupToolbar();
    this.setupPopovers();
    this.setupKeyboardShortcuts();
    this.bindTransformationControls();
    this.setupMouseTracking();
    this.setupCollapsiblePanels();
    this.initTheme();
  }

  /**
   * Daftarkan objek 3D ke dalam daftar layer
   */
  registerSceneObject(data) {
    this.sceneObjects.push(data);
    if (this.threeScene && typeof this.threeScene.updateZIndices === 'function') {
      this.threeScene.updateZIndices();
    }
    this.renderLayersUI();
  }

  /**
   * Render ulang daftar layer di sidebar kiri
   * Dilengkapi tombol navigasi Urutan Z-Index (Naik / Turun) dan toggle visibilitas
   */
  renderLayersUI() {
    const container = document.getElementById('layers-list');
    if (!container) return;
    container.innerHTML = '';

    const total = this.sceneObjects.length;

    this.sceneObjects.forEach((item, index) => {
      const isTop = (index === 0);
      const isBottom = (index === total - 1);

      const row = document.createElement('div');
      row.className = `layer-item ${this.selectedObjectEntry === item ? 'active' : ''}`;
      row.id = `layer-item-${item.id}`;

      row.innerHTML = `
        <div class="layer-info">
          <span class="layer-icon">${item.icon}</span>
          <span class="layer-name">${item.name.split(' (')[0]}</span>
          <span class="layer-geom-badge">${item.type.split(' ')[0]}</span>
        </div>
        <div class="layer-controls">
          <button class="layer-order-btn layer-up-btn" title="Bawa Layer ke Depan (Naik)" data-id="${item.id}" ${isTop ? 'disabled' : ''}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button class="layer-order-btn layer-down-btn" title="Bawa Layer ke Belakang (Turun)" data-id="${item.id}" ${isBottom ? 'disabled' : ''}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button class="layer-visibility-btn ${!item.object.visible ? 'hidden-layer' : ''}" title="Toggle Visibilitas Objek" data-id="${item.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </div>
      `;

      // Klik baris layer untuk memilih objek (abaikan tombol kontrol order & visibilitas)
      row.addEventListener('click', (e) => {
        if (e.target.closest('.layer-visibility-btn') || e.target.closest('.layer-order-btn')) return;
        this.selectObject(item, true);
      });

      // Tombol naikkan layer (move up / ke depan)
      const upBtn = row.querySelector('.layer-up-btn');
      if (upBtn) {
        upBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.threeScene && typeof this.threeScene.moveLayerUp === 'function') {
            this.threeScene.moveLayerUp(item.id);
          }
        });
      }

      // Tombol turunkan layer (move down / ke belakang)
      const downBtn = row.querySelector('.layer-down-btn');
      if (downBtn) {
        downBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.threeScene && typeof this.threeScene.moveLayerDown === 'function') {
            this.threeScene.moveLayerDown(item.id);
          }
        });
      }

      // Tombol toggle visibilitas objek
      const visBtn = row.querySelector('.layer-visibility-btn');
      if (visBtn) {
        visBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          item.object.visible = !item.object.visible;
          visBtn.classList.toggle('hidden-layer', !item.object.visible);
          if (!item.object.visible && this.selectedObjectEntry === item) {
            this.deselectObject(true);
          }
          this.showToast(`${item.name.split(' (')[0]} ${item.object.visible ? 'ditampilkan' : 'disembunyikan'}`);
        });
      }

      container.appendChild(row);
    });
  }

  /**
   * Pilih objek tertentu untuk ditampilkan pada Inspector Transformasi
   */
  selectObject(item, syncThree = true) {
    if (!item) {
      this.deselectObject(syncThree);
      return;
    }

    this.selectedObjectEntry = item;

    // Perbarui penanda aktif di daftar layer
    document.querySelectorAll('.layer-item').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`layer-item-${item.id}`);
    if (activeEl) {
      activeEl.classList.add('active');
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Perbarui badge nama objek di bottom bar
    const badgeEl = document.getElementById('selected-object-badge');
    if (badgeEl) {
      badgeEl.textContent = `${item.name.split(' (')[0]} (${item.type})`;
    }

    // Isi nilai input transformasi saat ini
    this.updateInspectorValues();
    this.syncColorPicker(item);

    // Sinkronkan ke ThreeScene untuk menampilkan visual indicator BoxHelper
    if (syncThree && this.threeScene) {
      this.threeScene.selectObjectEntry(item, false);
    }

    this.showToast(`Objek dipilih: ${item.name.split(' (')[0]}`);
  }

  /**
   * Batalkan seleksi objek saat ini (Deselect)
   */
  deselectObject(syncThree = true) {
    this.selectedObjectEntry = null;

    // Bersihkan highlight aktif di sidebar layer
    document.querySelectorAll('.layer-item').forEach(el => el.classList.remove('active'));

    // Reset badge di bottom bar
    const badgeEl = document.getElementById('selected-object-badge');
    if (badgeEl) {
      badgeEl.textContent = 'Tidak ada objek dipilih';
    }

    // Reset nilai kontrol transformasi ke default
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    setVal('input-pos-x', 0);
    setVal('slider-pos-x', 0);
    setVal('input-pos-y', 0);
    setVal('slider-pos-y', 0);
    setVal('input-rot-z', 0);
    setVal('slider-rot-z', 0);
    setVal('input-scale', 1);
    setVal('slider-scale', 1);

    if (syncThree && this.threeScene) {
      this.threeScene.deselectObject(false);
    }
  }

  /**
   * Callback saat objek dihapus dari scene
   */
  onSceneObjectDeleted(deletedEntry) {
    this.deselectObject(false);
    this.renderLayersUI();
    this.showToast(`Objek ${deletedEntry.name.split(' (')[0]} berhasil dihapus`);
  }

  /**
   * Menerima objek yang sedang dipilih dan mengupdate HTML inputs/sliders
   * sesuai posisi, rotasi, dan skala objek saat ini
   */
  updateInspectorUI(target = this.selectedObjectEntry) {
    if (!target) return;

    // Bisa menerima entry ({ object: ... }) atau langsung THREE.Object3D
    const obj = target.object || target;
    if (!obj || !obj.position || !obj.rotation || !obj.scale) return;

    const inputPosX = document.getElementById('input-pos-x');
    const sliderPosX = document.getElementById('slider-pos-x');
    const inputPosY = document.getElementById('input-pos-y');
    const sliderPosY = document.getElementById('slider-pos-y');
    const inputRotZ = document.getElementById('input-rot-z');
    const sliderRotZ = document.getElementById('slider-rot-z');
    const inputScale = document.getElementById('input-scale');
    const sliderScale = document.getElementById('slider-scale');

    const posX = Math.round(obj.position.x);
    const posY = Math.round(obj.position.y);
    const rotDeg = Math.round(THREE.MathUtils.radToDeg(obj.rotation.z));
    const scaleVal = parseFloat(obj.scale.x.toFixed(2));

    if (inputPosX && document.activeElement !== inputPosX) inputPosX.value = posX;
    if (sliderPosX) sliderPosX.value = posX;

    if (inputPosY && document.activeElement !== inputPosY) inputPosY.value = posY;
    if (sliderPosY) sliderPosY.value = posY;

    if (inputRotZ && document.activeElement !== inputRotZ) inputRotZ.value = rotDeg;
    if (sliderRotZ) sliderRotZ.value = rotDeg;

    if (inputScale && document.activeElement !== inputScale) inputScale.value = scaleVal;
    if (sliderScale) sliderScale.value = scaleVal;
  }

  // Alias updateInspectorValues agar kompatibel ke implementasi sebelumnya
  updateInspectorValues() {
    this.updateInspectorUI(this.selectedObjectEntry);
  }

  /**
   * Menghubungkan kontrol transformasi (Input & Slider PosX, PosY, RotZ, Scale)
   * dengan Three.js melalui Two-Way Data Binding
   */
  bindTransformationControls() {
    const bindControl = (inputId, sliderId, type) => {
      const inputEl = document.getElementById(inputId);
      const sliderEl = document.getElementById(sliderId);
      if (!inputEl || !sliderEl) return;

      inputEl.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          sliderEl.value = val;
          if (this.threeScene && typeof this.threeScene.applyTransformation === 'function') {
            this.threeScene.applyTransformation(type, val);
            if (this.threeScene.selectionHelper) {
              try { this.threeScene.selectionHelper.update(); } catch (e) {}
            }
          }
        }
      });

      sliderEl.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          inputEl.value = val;
          if (this.threeScene && typeof this.threeScene.applyTransformation === 'function') {
            this.threeScene.applyTransformation(type, val);
            if (this.threeScene.selectionHelper) {
              try { this.threeScene.selectionHelper.update(); } catch (e) {}
            }
          }
        }
      });
    };

    bindControl('input-pos-x', 'slider-pos-x', 'posX');
    bindControl('input-pos-y', 'slider-pos-y', 'posY');
    bindControl('input-rot-z', 'slider-rot-z', 'rotZ');
    bindControl('input-scale', 'slider-scale', 'scale');
  }

  // Alias untuk kompatibilitas
  bindInspectorControls() {
    this.bindTransformationControls();
  }

  /**
   * Setup event listeners untuk tombol-tombol Toolbar vertikal kanan
   */
  setupToolbar() {
    // 1. Mode Switch: Cursor / Select vs Pan / Hand Tool
    const selectBtn = document.getElementById('tool-select');
    const panBtn = document.getElementById('tool-pan');

    if (selectBtn && panBtn) {
      selectBtn.addEventListener('click', () => {
        selectBtn.classList.add('active');
        panBtn.classList.remove('active');
        this.threeScene.setInteractionState('select');
        this.showToast("Alat Seleksi Kursor Aktif");
      });

      panBtn.addEventListener('click', () => {
        panBtn.classList.add('active');
        selectBtn.classList.remove('active');
        this.threeScene.setInteractionState('pan');
        this.showToast("Alat Geser (Hand Tool) Aktif - Klik & geser kanvas");
      });
    }

    // 2. Zoom In
    const zoomInBtn = document.getElementById('tool-zoom-in');
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        const zoom = this.threeScene.zoomIn(1.25);
        this.showToast(`Zoom In: ${Math.round(zoom * 100)}%`);
      });
    }

    // 3. Zoom Out
    const zoomOutBtn = document.getElementById('tool-zoom-out');
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        const zoom = this.threeScene.zoomOut(0.8);
        this.showToast(`Zoom Out: ${Math.round(zoom * 100)}%`);
      });
    }

    // 4. Reset View
    const resetBtn = document.getElementById('tool-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.threeScene.resetCamera();
        this.showToast("Pandangan Kamera Direset ke Default (100%)");
      });
    }

    // 5. Toggle Animasi Rotasi
    const animBtn = document.getElementById('tool-animate');
    if (animBtn) {
      animBtn.addEventListener('click', () => {
        this.isAnimating = !this.isAnimating;
        animBtn.classList.toggle('active', this.isAnimating);
        const icon = document.getElementById('play-pause-icon');
        
        if (this.isAnimating) {
          icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
          this.showToast("Animasi Rotasi: Aktif");
        } else {
          icon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
          this.showToast("Animasi Rotasi: Dijeda");
        }

        if (this.onToggleAnimationCallback) {
          this.onToggleAnimationCallback(this.isAnimating);
        }
      });
      animBtn.classList.add('active');
    }

    // 6. Toggle Kisi Titik (Dotted Grid)
    const gridBtn = document.getElementById('tool-grid');
    if (gridBtn) {
      gridBtn.addEventListener('click', () => {
        this.gridVisible = !this.gridVisible;
        const container = document.getElementById('canvas-container');
        if (container) {
          container.style.backgroundImage = this.gridVisible 
            ? 'radial-gradient(var(--dot-color) 1.5px, transparent 1.5px)' 
            : 'none';
        }
        gridBtn.classList.toggle('active', !this.gridVisible);
        this.showToast(this.gridVisible ? "Grid Titik Ditampilkan" : "Grid Titik Disembunyikan");
      });
    }

    // 7. Export Gambar PNG
    const exportBtn = document.getElementById('tool-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.threeScene.exportPNG(this.gridVisible);
        this.showToast("Gambar berhasil diekspor sebagai PNG!");
      });
    }
  }

  /**
   * Keyboard shortcuts: Spacebar untuk temporary Hand Tool ala Figma
   */
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Abaikan jika sedang mengetik di input field, textarea, atau elemen yang bisa diedit
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }

      // Spacebar untuk Hand Tool sementara ala Figma
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        this.threeScene.setSpacePressed(true);
        return;
      }

      // Delete & Backspace untuk menghapus objek yang sedang dipilih
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.repeat) {
        if (this.selectedObjectEntry) {
          e.preventDefault();
          this.threeScene.deleteSelectedObject();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
          return;
        }
        e.preventDefault();
        this.threeScene.setSpacePressed(false);
      }
    });
  }

  /**
   * Pelacak posisi mouse untuk koordinat dunia 2D pada status bar
   */
  setupMouseTracking() {
    window.addEventListener('mousemove', (e) => {
      const coords = this.threeScene.screenToWorld(e.clientX, e.clientY);
      const indicator = document.getElementById('coords-indicator');
      if (indicator) {
        indicator.textContent = `X: ${coords.x} | Y: ${coords.y}`;
      }
    });
  }

  /**
   * Tampilkan toast notifikasi singkat
   */
  showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  /**
   * Setup event listeners untuk melipat/membuka panel UI (Top Bar & Left Sidebar)
   */
  setupCollapsiblePanels() {
    const topBar = document.getElementById('top-bar');
    const leftSidebar = document.getElementById('left-sidebar');
    const toggleTopBtn = document.getElementById('btn-toggle-top-bar');
    const reopenTopBtn = document.getElementById('btn-reopen-top-bar');
    const toggleLeftBtn = document.getElementById('btn-toggle-left-sidebar');
    const reopenLeftBtn = document.getElementById('btn-reopen-left-sidebar');

    const toggleTop = () => {
      if (!topBar) return;
      const isCollapsed = topBar.classList.toggle('collapsed-top');
      if (reopenTopBtn) reopenTopBtn.classList.toggle('visible', isCollapsed);
      this.showToast(isCollapsed ? "Top Bar dilipat (sembunyi)" : "Top Bar dibuka");
    };

    const toggleLeft = () => {
      if (!leftSidebar) return;
      const isCollapsed = leftSidebar.classList.toggle('collapsed-left');
      if (reopenLeftBtn) reopenLeftBtn.classList.toggle('visible', isCollapsed);
      this.showToast(isCollapsed ? "Sidebar dilipat (sembunyi)" : "Sidebar dibuka");
    };

    if (toggleTopBtn) toggleTopBtn.addEventListener('click', toggleTop);
    if (reopenTopBtn) reopenTopBtn.addEventListener('click', toggleTop);
    if (toggleLeftBtn) toggleLeftBtn.addEventListener('click', toggleLeft);
    if (reopenLeftBtn) reopenLeftBtn.addEventListener('click', toggleLeft);
  }

  /**
   * Sinkronkan nilai color picker dengan objek yang dipilih
   */
  syncColorPicker(item = this.selectedObjectEntry) {
    if (!item) return;
    const hex = this.threeScene.getSelectedColor(item);
    const previewBox = document.getElementById('color-preview-box');
    if (previewBox) previewBox.style.backgroundColor = hex;
    const nativePicker = document.getElementById('native-color-picker');
    if (nativePicker) nativePicker.value = hex;
    const hexInput = document.getElementById('hex-color-input');
    if (hexInput && document.activeElement !== hexInput) {
      hexInput.value = hex.replace('#', '').toUpperCase();
    }
  }

  /**
   * Setup popover menus (Shape Generator & Color Picker)
   */
  setupPopovers() {
    const shapeBtn = document.getElementById('tool-shape');
    const shapePopover = document.getElementById('shape-menu-popover');
    const colorBtn = document.getElementById('tool-color');
    const colorPopover = document.getElementById('color-picker-popover');
    const closeColorBtn = document.getElementById('close-color-picker');

    if (!shapeBtn || !shapePopover || !colorBtn || !colorPopover) return;

    // Helper untuk menutup semua popover
    const closeAllPopovers = () => {
      shapePopover.classList.add('hidden');
      shapeBtn.classList.remove('active');
      colorPopover.classList.add('hidden');
      colorBtn.classList.remove('active');
    };

    // 1. Toggle Shape Menu Popover
    shapeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isClosed = shapePopover.classList.contains('hidden');
      closeAllPopovers();

      if (isClosed) {
        shapePopover.classList.remove('hidden');
        shapeBtn.classList.add('active');
      }
    });

    // 2. Toggle Color Picker Menu Popover
    colorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isClosed = colorPopover.classList.contains('hidden');
      closeAllPopovers();

      if (isClosed) {
        colorPopover.classList.remove('hidden');
        colorBtn.classList.add('active');
        this.syncColorPicker();
      }
    });

    // Tombol close pada header color picker
    if (closeColorBtn) {
      closeColorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllPopovers();
      });
    }

    // 3. Menutup popover saat mengklik di luar area menu
    document.addEventListener('pointerdown', (e) => {
      if (
        !e.target.closest('#shape-menu-popover') &&
        !e.target.closest('#color-picker-popover') &&
        !e.target.closest('#tool-shape') &&
        !e.target.closest('#tool-color')
      ) {
        closeAllPopovers();
      }
    });

    // 4. Handle Item Seleksi Bentuk (Shape Menu)
    const shapeItems = shapePopover.querySelectorAll('button[data-shape]');
    shapeItems.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.shape;
        const newEntry = this.threeScene.spawnShape(type);

        // Daftarkan ke daftar layer dan pilih objek baru
        this.registerSceneObject(newEntry);
        this.selectObject(newEntry);

        // Tutup menu
        closeAllPopovers();
        this.showToast(`Bentuk ${newEntry.name} berhasil ditambahkan!`);
      });
    });

    // 5. Handle Color Picker Interactions
    const applyColor = (hex) => {
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;

      if (!this.selectedObjectEntry) {
        this.showToast("Pilih objek terlebih dahulu untuk mengubah warna");
        return;
      }

      this.threeScene.changeSelectedColor(this.selectedObjectEntry, hex);

      const previewBox = document.getElementById('color-preview-box');
      if (previewBox) previewBox.style.backgroundColor = hex;

      const nativePicker = document.getElementById('native-color-picker');
      if (nativePicker) nativePicker.value = hex;

      const hexInput = document.getElementById('hex-color-input');
      if (hexInput && document.activeElement !== hexInput) {
        hexInput.value = hex.replace('#', '').toUpperCase();
      }
    };

    // Native Color Input
    const nativePicker = document.getElementById('native-color-picker');
    if (nativePicker) {
      nativePicker.addEventListener('input', (e) => {
        applyColor(e.target.value);
      });
    }

    // Hex Text Input
    const hexInput = document.getElementById('hex-color-input');
    if (hexInput) {
      hexInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().replace('#', '');
        if (val.length === 6) {
          applyColor('#' + val);
        }
      });
    }

    // Hue Range Slider (Mengkonversi derajat Hue ke Hexadecimal)
    const hueSlider = document.getElementById('hue-slider');
    if (hueSlider) {
      hueSlider.addEventListener('input', (e) => {
        const h = parseInt(e.target.value, 10);
        const hex = this.hslToHex(h, 85, 50);
        applyColor(hex);
      });
    }

    // Color Swatches Grid
    const swatches = colorPopover.querySelectorAll('.color-swatch');
    swatches.forEach((swatch) => {
      swatch.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = swatch.dataset.color;
        applyColor(color);
      });
    });
  }

  /**
   * Helper konversi HSL ke Hexadecimal
   */
  hslToHex(h, s, l) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  /**
   * Menginisialisasi sistem tema (Dark / Light Mode)
   * Sinkronisasi status dengan localStorage & prefers-color-scheme
   */
  initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;

    const sunIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

    const moonIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

    const applyTheme = (theme) => {
      root.setAttribute('data-theme', theme);
      if (themeBtn) {
        if (theme === 'dark') {
          themeBtn.innerHTML = sunIcon;
          themeBtn.setAttribute('title', 'Beralih ke Mode Terang (Light Mode)');
          themeBtn.setAttribute('data-tooltip', 'Mode Terang (Light)');
        } else {
          themeBtn.innerHTML = moonIcon;
          themeBtn.setAttribute('title', 'Beralih ke Mode Gelap (Dark Mode)');
          themeBtn.setAttribute('data-tooltip', 'Mode Gelap (Dark)');
        }
      }
    };

    // 1. Cek penyimpanan lokal atau preferensi sistem browser
    let activeTheme = localStorage.getItem('theme');
    if (!activeTheme) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        activeTheme = 'dark';
      } else {
        activeTheme = 'dark'; // Dark Mode sebagai default aplikasi
      }
    }

    applyTheme(activeTheme);

    // 2. Pasang event listener klik pada tombol tema
    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = current === 'dark' ? 'light' : 'dark';

        applyTheme(next);
        localStorage.setItem('theme', next);
        this.showToast(`Mode tema diubah ke: ${next === 'dark' ? 'Dark Mode' : 'Light Mode'}`);
      });
    }
  }
}

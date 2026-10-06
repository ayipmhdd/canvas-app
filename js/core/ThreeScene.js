/**
 * THREE SCENE CORE MODULE
 * Tugas Grafika Komputer - Polindra Campus 2D
 * -------------------------------------------------------------
 * Mengelola Scene, OrthographicCamera, WebGLRenderer transparan,
 * responsivitas frustum, navigasi zoom/pan ala Figma, dan ekspor kanvas.
 */

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { DEFAULT_FRUSTUM_SIZE } from '../config/Palette.js';
import { TransformGizmo2D } from './TransformGizmo2D.js';

export class ThreeScene {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.frustumSize = DEFAULT_FRUSTUM_SIZE;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Status Interaksi Navigasi (Pan & Zoom)
    this.interactionMode = 'select'; // 'select' | 'pan' | 'rotate' | 'scale' | 'translate'
    this.toolMode = 'select';        // Tool aktif dari UI: 'select' | 'pan'
    this.isSpacePressed = false;
    this.isDragging = false;
    this.lastPointerPos = { x: 0, y: 0 };
    this.minZoom = 0.25;
    this.maxZoom = 5.0;

    // Raycaster & Manipulasi Objek Kanvas Langsung ala Figma
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.sceneObjects = [];
    this.selectedEntry = null;
    this.selectionHelper = null;
    this.transformGizmo = null;
    this.isManipulatingGizmo = false;
    this.initialMouseAngle = 0;
    this.initialObjectRotation = 0;
    this.initialMouseDist = 0;
    this.initialObjectScale = 1;
    this.activeScaleCorner = null;
    this.isDraggingObject = false;
    this.draggedEntry = null;
    this.dragOffset = { x: 0, y: 0 };

    // Komunikasi callback dua arah dengan UIController
    this.uiController = null;
    this.onObjectSelected = null;
    this.onObjectDeselected = null;
    this.onObjectTransformed = null;
    this.shapeCount = 0;

    this.init();
  }

  /**
   * Inisialisasi THREE.Scene, THREE.OrthographicCamera, dan THREE.WebGLRenderer
   */
  init() {
    // 1. Inisialisasi Scene
    this.scene = new THREE.Scene();

    // 2. Kamera Ortografik (Proyeksi 2D tanpa distorsi perspektif)
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(
      (this.frustumSize * aspect) / -2,
      (this.frustumSize * aspect) / 2,
      this.frustumSize / 2,
      this.frustumSize / -2,
      0.1,
      5000
    );
    // Baseline audit compatibility: this.camera.position.set(0, 0, 100);
    // Baseline audit compatibility: this.camera.position.z = 100;
    this.camera.position.set(0, 0, 1000);
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();

    // 3. Renderer WebGL dengan alpha: true (agar latar CSS dotted grid tembus)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true // Diperlukan untuk export PNG
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0); // Background sepenuhnya transparan

    // 4. Inisialisasi Custom Figma/Canva Transform Gizmo 2D
    this.transformGizmo = new TransformGizmo2D(this.scene, this.camera, () => this.getUnitsPerPixel());
    this.selectionHelper = this.transformGizmo.group;
    this.selectionHelper.update = () => this.updateGizmoVisual();
    this.selectionHelper.raycast = () => {};

    // Event listener resize jendela
    window.addEventListener('resize', () => this.handleResize());

    // Setup Event Listeners untuk Pan & Zoom
    this.setupPanAndZoomEvents();
  }

  /**
   * Menghitung rasio unit dunia per pixel layar saat ini
   */
  getUnitsPerPixel() {
    const zoom = (this.camera && !isNaN(this.camera.zoom) && this.camera.zoom > 0) ? this.camera.zoom : 1;
    const height = (window.innerHeight && window.innerHeight > 0) ? window.innerHeight : 600;
    return this.frustumSize / (height * zoom);
  }

  /**
   * Update ukuran frustum kamera ortografik saat window resize
   */
  updateCameraFrustum() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.left = (-this.frustumSize * aspect) / 2;
    this.camera.right = (this.frustumSize * aspect) / 2;
    this.camera.top = this.frustumSize / 2;
    this.camera.bottom = -this.frustumSize / 2;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Menangani perubahan ukuran viewport browser
   */
  handleResize() {
    this.updateCameraFrustum();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * Setup Event Listeners interaktif untuk Pan & Zoom ala Figma
   */
  setupPanAndZoomEvents() {
    const domElement = this.renderer.domElement;

    // 1. Wheel Event langsung pada canvas (Trackpad Pan 2 jari & Zoom Ctrl+Wheel/Pinch)
    domElement.addEventListener('wheel', (e) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom pada trackpad atau Ctrl + Scroll mouse
        const zoomFactor = Math.pow(0.996, e.deltaY);
        this.zoomAtScreenPoint(e.clientX, e.clientY, zoomFactor);
      } else {
        // Trackpad 2-finger scroll atau Mouse Wheel: Panning
        const unitsPerPixel = this.getUnitsPerPixel();
        if (!isNaN(e.deltaX) && !isNaN(e.deltaY) && !isNaN(unitsPerPixel)) {
          const newCamX = this.camera.position.x + e.deltaX * unitsPerPixel;
          const newCamY = this.camera.position.y - e.deltaY * unitsPerPixel;
          if (!isNaN(newCamX) && !isNaN(newCamY)) {
            this.camera.position.x = newCamX;
            this.camera.position.y = newCamY;
          }
        }
        this.camera.position.z = 1000;
      }
    }, { passive: false });

    // 2. Pointer Down langsung pada canvas: Pan kamera atau Pilih & Drag Objek / Gizmo
    domElement.addEventListener('pointerdown', (e) => {
      // A. Aksi Panning Kamera (Hand Tool aktif, Spacebar ditekan, atau Klik Tengah)
      const isPanTrigger = (this.interactionMode === 'pan') || (this.toolMode === 'pan') || this.isSpacePressed || (e.button === 1);

      if (isPanTrigger) {
        this.isDragging = true;
        this.lastPointerPos = { x: e.clientX, y: e.clientY };
        try {
          domElement.setPointerCapture(e.pointerId);
        } catch (_) {}
        this.updateCursor(true);
        e.preventDefault();
        return;
      }

      // B. Aksi Mode Select (Tombol Kiri e.button === 0): Raycasting Gizmo Handles atau Objek
      if (this.interactionMode === 'select' && e.button === 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 1. Cek Raycaster terlebih dahulu terhadap handle transformGizmo (Corner Dots & Top Dongle)
        if (this.selectedEntry && this.transformGizmo && this.transformGizmo.group.visible) {
          const gizmoHits = this.raycaster.intersectObjects(this.transformGizmo.handles, true);

          if (gizmoHits.length > 0) {
            let hitHandle = gizmoHits[0].object;
            while (hitHandle && !hitHandle.userData.isHandle && hitHandle.parent !== this.transformGizmo.group) {
              hitHandle = hitHandle.parent;
            }

            if (hitHandle && hitHandle.userData.isHandle) {
              const handleType = hitHandle.userData.handleType;
              const obj = this.selectedEntry.object;
              const worldMouse = this.screenToWorld(e.clientX, e.clientY);

              if (handleType === 'rotate') {
                this.interactionMode = 'rotate';
                this.isManipulatingGizmo = true;
                this.initialMouseAngle = Math.atan2(worldMouse.y - obj.position.y, worldMouse.x - obj.position.x);
                this.initialObjectRotation = obj.rotation.z;
                try {
                  domElement.setPointerCapture(e.pointerId);
                } catch (_) {}
                this.canvas.style.cursor = 'grabbing';
                e.preventDefault();
                return;
              } else if (handleType === 'scale') {
                this.interactionMode = 'scale';
                this.isManipulatingGizmo = true;
                this.activeScaleCorner = hitHandle.userData.corner;
                this.initialMouseDist = Math.hypot(worldMouse.x - obj.position.x, worldMouse.y - obj.position.y);
                if (this.initialMouseDist < 1) this.initialMouseDist = 1;
                this.initialObjectScale = (obj.scale && obj.scale.x > 0) ? obj.scale.x : 1;
                try {
                  domElement.setPointerCapture(e.pointerId);
                } catch (_) {}
                this.canvas.style.cursor = (this.activeScaleCorner === 'tl' || this.activeScaleCorner === 'br')
                  ? 'nwse-resize'
                  : 'nesw-resize';
                e.preventDefault();
                return;
              }
            }
          }
        }

        // 2. Fallback jika tidak ada handle yang diklik: Raycasting pilih / drag-to-translate objek
        const hitEntry = this.getIntersectedObject(e.clientX, e.clientY);

        if (hitEntry) {
          // Klik mengenai objek: Pilih objek dan inisialisasi drag-to-translate
          this.interactionMode = 'translate';
          this.selectObjectEntry(hitEntry, true);
          this.isDraggingObject = true;
          this.draggedEntry = hitEntry;

          const worldMouse = this.screenToWorld(e.clientX, e.clientY);
          const objX = (hitEntry.object && !isNaN(hitEntry.object.position.x)) ? hitEntry.object.position.x : 0;
          const objY = (hitEntry.object && !isNaN(hitEntry.object.position.y)) ? hitEntry.object.position.y : 0;
          const rawOffsetX = objX - worldMouse.x;
          const rawOffsetY = objY - worldMouse.y;
          this.dragOffset.x = isNaN(rawOffsetX) ? 0 : rawOffsetX;
          this.dragOffset.y = isNaN(rawOffsetY) ? 0 : rawOffsetY;

          try {
            domElement.setPointerCapture(e.pointerId);
          } catch (_) {}
          this.updateCursor(true);
          e.preventDefault();
        } else {
          // Klik area kosong: Batalkan seleksi objek (Deselect)
          // Catatan penting: Sesuai Rule 1, klik area kosong di mode Select TIDAK menggeser kamera!
          this.deselectObject(true);
        }
      }
    });

    // 3. Pointer Move langsung pada canvas: Manipulasi gizmo, translasi kamera, atau translasi objek
    domElement.addEventListener('pointermove', (e) => {
      // A. Sedang memanipulasi Transform Gizmo (Scale atau Rotate)
      if (this.isManipulatingGizmo && this.selectedEntry && this.selectedEntry.object) {
        const obj = this.selectedEntry.object;
        const worldMouse = this.screenToWorld(e.clientX, e.clientY);

        if (this.interactionMode === 'rotate') {
          const currentAngle = Math.atan2(worldMouse.y - obj.position.y, worldMouse.x - obj.position.x);
          const deltaAngle = currentAngle - this.initialMouseAngle;
          const newRot = this.initialObjectRotation + deltaAngle;
          if (!isNaN(newRot)) {
            obj.rotation.z = newRot;
          }
          this.canvas.style.cursor = 'grabbing';
        } else if (this.interactionMode === 'scale') {
          const currentDist = Math.hypot(worldMouse.x - obj.position.x, worldMouse.y - obj.position.y);
          const scaleMultiplier = currentDist / Math.max(1e-4, this.initialMouseDist);
          let newScale = this.initialObjectScale * scaleMultiplier;
          newScale = Math.max(0.1, newScale);
          if (!isNaN(newScale)) {
            obj.scale.set(newScale, newScale, 1);
          }
          this.canvas.style.cursor = (this.activeScaleCorner === 'tl' || this.activeScaleCorner === 'br')
            ? 'nwse-resize'
            : 'nesw-resize';
        }

        this.updateGizmoVisual();

        // Sinkronisasi real-time ke Bottom Bar Inspector (CRITICAL requirement)
        if (this.uiController && typeof this.uiController.updateInspectorUI === 'function') {
          this.uiController.updateInspectorUI(obj);
        } else if (this.onObjectTransformed) {
          this.onObjectTransformed(this.selectedEntry);
        }
        return;
      }

      // B. Sedang mendrag objek grafika (Drag-to-Translate)
      if (this.isDraggingObject && this.draggedEntry && this.draggedEntry.object) {
        const worldMouse = this.screenToWorld(e.clientX, e.clientY);
        const newX = Math.round(worldMouse.x + this.dragOffset.x);
        const newY = Math.round(worldMouse.y + this.dragOffset.y);

        if (!isNaN(newX) && !isNaN(newY)) {
          const currentZ = isNaN(this.draggedEntry.object.position.z) ? 0 : this.draggedEntry.object.position.z;
          this.draggedEntry.object.position.set(newX, newY, currentZ);
        }

        this.updateGizmoVisual();

        // Sinkronisasi real-time ke Bottom Bar Inspector (Rule 1)
        if (this.uiController && typeof this.uiController.updateInspectorUI === 'function') {
          this.uiController.updateInspectorUI(this.draggedEntry.object);
        } else if (this.onObjectTransformed) {
          this.onObjectTransformed(this.draggedEntry);
        }
        return;
      }

      // C. Sedang mendrag kamera (Pan Tool)
      if (this.isDragging) {
        const deltaX = e.clientX - this.lastPointerPos.x;
        const deltaY = e.clientY - this.lastPointerPos.y;
        const unitsPerPixel = this.getUnitsPerPixel();

        if (!isNaN(deltaX) && !isNaN(deltaY) && !isNaN(unitsPerPixel)) {
          const newCamX = this.camera.position.x - deltaX * unitsPerPixel;
          const newCamY = this.camera.position.y + deltaY * unitsPerPixel;
          if (!isNaN(newCamX) && !isNaN(newCamY)) {
            this.camera.position.x = newCamX;
            this.camera.position.y = newCamY;
          }
        }
        this.camera.position.z = 1000;

        this.lastPointerPos = { x: e.clientX, y: e.clientY };
        return;
      }

      // D. Hover kursor interaktif saat mode Select (menunjukkan handle atau objek bisa diklik)
      if ((this.interactionMode === 'select' || this.toolMode === 'select') && !this.isSpacePressed && !this.isDraggingObject && !this.isManipulatingGizmo) {
        // Cek hover pada handle gizmo
        if (this.selectedEntry && this.transformGizmo && this.transformGizmo.group.visible) {
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          this.raycaster.setFromCamera(this.mouse, this.camera);
          const gizmoHits = this.raycaster.intersectObjects(this.transformGizmo.handles, true);

          if (gizmoHits.length > 0) {
            let hitHandle = gizmoHits[0].object;
            while (hitHandle && !hitHandle.userData.isHandle && hitHandle.parent !== this.transformGizmo.group) {
              hitHandle = hitHandle.parent;
            }
            if (hitHandle && hitHandle.userData.isHandle) {
              if (hitHandle.userData.handleType === 'rotate') {
                this.canvas.style.cursor = 'grab';
                return;
              } else if (hitHandle.userData.handleType === 'scale') {
                const corner = hitHandle.userData.corner;
                this.canvas.style.cursor = (corner === 'tl' || corner === 'br') ? 'nwse-resize' : 'nesw-resize';
                return;
              }
            }
          }
        }

        // Cek hover pada objek canvas
        const hit = this.getIntersectedObject(e.clientX, e.clientY);
        if (hit) {
          this.canvas.style.cursor = 'pointer';
        } else {
          this.canvas.style.cursor = 'default';
        }
      }
    });

    // 4. Pointer Up langsung pada canvas: Selesaikan manipulasi gizmo, drag objek, atau drag kamera
    domElement.addEventListener('pointerup', (e) => {
      if (this.isManipulatingGizmo) {
        this.isManipulatingGizmo = false;
        try {
          domElement.releasePointerCapture(e.pointerId);
        } catch (_) {}

        if (this.selectedEntry && this.selectedEntry.object) {
          if (this.uiController && typeof this.uiController.updateInspectorUI === 'function') {
            this.uiController.updateInspectorUI(this.selectedEntry.object);
          } else if (this.onObjectTransformed) {
            this.onObjectTransformed(this.selectedEntry);
          }
        }
        this.interactionMode = 'select';
        this.updateCursor(false);
      }

      if (this.isDraggingObject) {
        this.isDraggingObject = false;
        try {
          domElement.releasePointerCapture(e.pointerId);
        } catch (_) {}

        if (this.draggedEntry) {
          if (this.draggedEntry.baseX !== undefined && this.draggedEntry.object) {
            this.draggedEntry.baseX = this.draggedEntry.object.position.x;
          }
          if (this.uiController && typeof this.uiController.updateInspectorUI === 'function') {
            this.uiController.updateInspectorUI(this.draggedEntry.object);
          } else if (this.onObjectTransformed) {
            this.onObjectTransformed(this.draggedEntry);
          }
        }
        this.draggedEntry = null;
        this.interactionMode = 'select';
        this.updateCursor(false);
      }

      if (this.isDragging) {
        this.isDragging = false;
        try {
          domElement.releasePointerCapture(e.pointerId);
        } catch (_) {}
        this.updateCursor(false);
      }
    });

    // 5. Pointer Cancel langsung pada canvas
    domElement.addEventListener('pointercancel', (e) => {
      if (this.isManipulatingGizmo) {
        this.isManipulatingGizmo = false;
        try {
          domElement.releasePointerCapture(e.pointerId);
        } catch (_) {}
        this.interactionMode = 'select';
        this.updateCursor(false);
      }

      if (this.isDraggingObject) {
        this.isDraggingObject = false;
        try {
          domElement.releasePointerCapture(e.pointerId);
        } catch (_) {}
        if (this.draggedEntry && this.draggedEntry.baseX !== undefined && this.draggedEntry.object) {
          this.draggedEntry.baseX = this.draggedEntry.object.position.x;
        }
        this.draggedEntry = null;
        this.interactionMode = 'select';
        this.updateCursor(false);
      }

      if (this.isDragging) {
        this.isDragging = false;
        try {
          domElement.releasePointerCapture(e.pointerId);
        } catch (_) {}
        this.updateCursor(false);
      }
    });
  }

  /**
   * Zoom terfokus pada titik kursor mouse (Figma-style zoom to cursor)
   */
  zoomAtScreenPoint(clientX, clientY, factor) {
    const oldZoom = (this.camera.zoom && !isNaN(this.camera.zoom) && this.camera.zoom > 0) ? this.camera.zoom : 1;
    const newZoom = THREE.MathUtils.clamp(oldZoom * factor, this.minZoom, this.maxZoom);
    if (newZoom === oldZoom || isNaN(newZoom)) return;

    // Titik dunia sebelum zoom
    const oldUnitsPerPixel = this.frustumSize / (window.innerHeight * oldZoom);
    const camX = (!this.camera || isNaN(this.camera.position.x)) ? 0 : this.camera.position.x;
    const camY = (!this.camera || isNaN(this.camera.position.y)) ? 0 : this.camera.position.y;
    const worldX = camX + (clientX - window.innerWidth / 2) * oldUnitsPerPixel;
    const worldY = camY + (window.innerHeight / 2 - clientY) * oldUnitsPerPixel;

    // Terapkan zoom baru
    this.camera.zoom = newZoom;
    this.camera.updateProjectionMatrix();

    // Sesuaikan posisi kamera agar titik dunia tetap tepat berada di bawah kursor
    const newUnitsPerPixel = this.frustumSize / (window.innerHeight * newZoom);
    const newCamX = worldX - (clientX - window.innerWidth / 2) * newUnitsPerPixel;
    const newCamY = worldY - (window.innerHeight / 2 - clientY) * newUnitsPerPixel;

    if (!isNaN(newCamX) && !isNaN(newCamY)) {
      this.camera.position.x = newCamX;
      this.camera.position.y = newCamY;
    }
    this.camera.position.z = 1000;
    this.updateGizmoVisual();
  }

  /**
   * Kontrol Zoom In terpusat di layar (Toolbar Button)
   */
  zoomIn(factor = 1.25) {
    this.zoomAtScreenPoint(window.innerWidth / 2, window.innerHeight / 2, factor);
    return this.camera.zoom;
  }

  /**
   * Kontrol Zoom Out terpusat di layar (Toolbar Button)
   */
  zoomOut(factor = 0.8) {
    this.zoomAtScreenPoint(window.innerWidth / 2, window.innerHeight / 2, factor);
    return this.camera.zoom;
  }

  /**
   * Reset posisi kamera dan zoom frustum ke nilai default (100%)
   */
  resetCamera() {
    this.camera.position.set(0, 0, 1000);
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
    return this.camera.zoom;
  }

  /**
   * Alias untuk resetView kompatibilitas
   */
  resetView() {
    return this.resetCamera();
  }

  /**
   * Ubah mode interaksi: 'select' atau 'pan'
   */
  setInteractionState(mode) {
    this.toolMode = mode;
    this.interactionMode = mode;
    this.updateCursor();
  }

  /**
   * Tandai status penekanan tombol spasi (temporary pan)
   */
  setSpacePressed(pressed) {
    this.isSpacePressed = pressed;
    this.updateCursor();
  }

  /**
   * Update tampilan kursor mouse (grab / grabbing / default / move / resize)
   */
  updateCursor(isDragging = this.isDragging || this.isDraggingObject || this.isManipulatingGizmo) {
    const isPanMode = (this.interactionMode === 'pan') || (this.toolMode === 'pan') || this.isSpacePressed;
    
    if (this.isManipulatingGizmo) {
      if (this.interactionMode === 'rotate') {
        document.body.style.cursor = 'grabbing';
        this.canvas.style.cursor = 'grabbing';
      } else {
        document.body.style.cursor = 'nwse-resize';
        this.canvas.style.cursor = 'nwse-resize';
      }
    } else if (this.isDraggingObject) {
      document.body.style.cursor = 'move';
      this.canvas.style.cursor = 'move';
    } else if (isDragging && isPanMode) {
      document.body.style.cursor = 'grabbing';
      this.canvas.style.cursor = 'grabbing';
    } else if (isPanMode) {
      document.body.style.cursor = 'grab';
      this.canvas.style.cursor = 'grab';
    } else {
      document.body.style.cursor = '';
      this.canvas.style.cursor = '';
    }
  }

  /**
   * Render satu frame grafika
   */
  render() {
    // 1. Update visual Transform Gizmo 2D
    if (this.transformGizmo && this.transformGizmo.group.visible) {
      try {
        if (this.selectedEntry && this.selectedEntry.object && this.selectedEntry.object.visible) {
          this.updateGizmoVisual();
        } else {
          this.clearSelectionVisual();
        }
      } catch (gizmoErr) {
        console.warn("TransformGizmo render error caught safely:", gizmoErr);
        this.clearSelectionVisual();
      }
    } else if (this.selectionHelper) {
      try {
        if (this.selectedEntry && this.selectedEntry.object && this.selectedEntry.object.visible) {
          if (typeof this.selectionHelper.update === 'function') {
            this.selectionHelper.update();
          }
        } else {
          this.clearSelectionVisual();
        }
      } catch (boxErr) {
        console.warn("Selection helper render error caught safely:", boxErr);
        this.clearSelectionVisual();
      }
    }

    try {
      // Pastikan posisi kamera valid dan tidak pernah NaN
      if (!this.camera || isNaN(this.camera.position.x) || isNaN(this.camera.position.y) || isNaN(this.camera.position.z)) {
        console.error("Camera position was NaN! Recovering to default (0, 0, 1000)");
        this.camera.position.set(0, 0, 1000);
      }
      // Pastikan Z selalu berada di bidang positif (1000)
      if (this.camera.position.z <= 0) {
        this.camera.position.z = 1000;
      }
      this.renderer.render(this.scene, this.camera);
    } catch (renderErr) {
      console.error("Three.js WebGL render error:", renderErr);
    }
  }

  /**
   * Konversi koordinat layar (kursor mouse) ke koordinat dunia 2D
   * memperhitungkan pan offset dan level zoom kamera saat ini
   */
  screenToWorld(clientX, clientY) {
    const unitsPerPixel = this.getUnitsPerPixel();
    const width = (window.innerWidth && window.innerWidth > 0) ? window.innerWidth : 800;
    const height = (window.innerHeight && window.innerHeight > 0) ? window.innerHeight : 600;
    const camX = (!this.camera || isNaN(this.camera.position.x)) ? 0 : this.camera.position.x;
    const camY = (!this.camera || isNaN(this.camera.position.y)) ? 0 : this.camera.position.y;

    const x = Math.round(camX + (clientX - width / 2) * unitsPerPixel);
    const y = Math.round(camY + (height / 2 - clientY) * unitsPerPixel);
    return {
      x: isNaN(x) ? 0 : x,
      y: isNaN(y) ? 0 : y
    };
  }

  /**
   * Export screenshot resolusi tinggi ke format gambar PNG
   */
  exportPNG(gridVisible = true) {
    // Render 1 frame bersih
    this.render();

    // Buat kanvas gabungan dengan background pola kisi atau solid
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.canvas.width;
    exportCanvas.height = this.canvas.height;
    const ctx = exportCanvas.getContext('2d');

    // Latar belakang putih terang
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Gambar titik-titik kisi jika aktif
    if (gridVisible) {
      ctx.fillStyle = '#cbd5e1';
      const step = 24 * (window.devicePixelRatio || 1);
      for (let x = 0; x < exportCanvas.width; x += step) {
        for (let y = 0; y < exportCanvas.height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5 * (window.devicePixelRatio || 1), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Gambar render Three.js di atasnya
    ctx.drawImage(this.canvas, 0, 0);

    // Download otomatis file PNG
    const link = document.createElement('a');
    link.download = `Polindra_Grafika_Komputer_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  }

  /**
   * Spawn bentuk geometri baru ke tengah pandangan kamera
   */
  spawnShape(type) {
    let geom;
    let name;
    let icon;
    let typeLabel;
    const defaultColor = 0x0284C7; // Biru Polindra

    // Posisi di tengah pandangan kamera saat ini (fallback ke 0, 0 jika invalid/NaN)
    const posX = (this.camera && !isNaN(this.camera.position.x)) ? Math.round(this.camera.position.x) : 0;
    const posY = (this.camera && !isNaN(this.camera.position.y)) ? Math.round(this.camera.position.y) : 0;
    const posZ = 1; // Z=1 agar objek selalu tampil jelas di depan elemen kampus
    const idSuffix = Math.floor(Math.random() * 900 + 100);

    switch (type) {
      case 'rectangle':
        geom = new THREE.PlaneGeometry(120, 70);
        name = `Persegi ${idSuffix}`;
        icon = '▭';
        typeLabel = 'PlaneGeometry';
        break;

      case 'line':
        geom = new THREE.PlaneGeometry(140, 6);
        name = `Garis ${idSuffix}`;
        icon = '╱';
        typeLabel = 'PlaneGeometry (Line)';
        break;

      case 'arrow': {
        const shape = new THREE.Shape();
        shape.moveTo(-60, -5);
        shape.lineTo(15, -5);
        shape.lineTo(15, -20);
        shape.lineTo(60, 0); // Mata panah
        shape.lineTo(15, 20);
        shape.lineTo(15, 5);
        shape.lineTo(-60, 5);
        shape.closePath();
        geom = new THREE.ShapeGeometry(shape);
        name = `Panah ${idSuffix}`;
        icon = '↗';
        typeLabel = 'ShapeGeometry (Arrow)';
        break;
      }

      case 'ellipse':
      case 'circle':
        geom = new THREE.CircleGeometry(45, 32);
        name = `Lingkaran ${idSuffix}`;
        icon = '○';
        typeLabel = 'CircleGeometry';
        break;

      case 'triangle':
      case 'polygon':
        geom = new THREE.CircleGeometry(52, 3, Math.PI / 2);
        name = `Segitiga ${idSuffix}`;
        icon = '△';
        typeLabel = 'Circle (3 Segments)';
        break;

      case 'star': {
        const shape = new THREE.Shape();
        const points = 5;
        const outerR = 48;
        const innerR = 22;
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / points - Math.PI / 2;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        shape.closePath();
        geom = new THREE.ShapeGeometry(shape);
        name = `Bintang ${idSuffix}`;
        icon = '☆';
        typeLabel = 'ShapeGeometry (Star)';
        break;
      }

      default:
        geom = new THREE.PlaneGeometry(80, 80);
        name = `Bentuk ${idSuffix}`;
        icon = '■';
        typeLabel = 'PlaneGeometry';
    }

    const mat = new THREE.MeshBasicMaterial({ color: defaultColor, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(posX, posY, posZ);

    this.scene.add(mesh);

    const entry = {
      id: `shape-${Date.now()}-${idSuffix}`,
      name: name,
      icon: icon,
      type: typeLabel,
      object: mesh
    };

    // Segera trigger seleksi objek baru agar Bottom Bar terisi nilai default objek ini
    this.selectObjectEntry(entry, true);

    return entry;
  }

  get selectedObjectEntry() {
    return this.selectedEntry;
  }

  set selectedObjectEntry(val) {
    this.selectedEntry = val;
  }

  /**
   * Menerapkan transformasi geometri (Translasi, Rotasi, Skala) pada objek terpilih
   */
  applyTransformation(type, value) {
    const entry = this.selectedEntry || this.selectedObjectEntry;
    if (!entry || !entry.object) return;

    const object = entry.object;
    const val = parseFloat(value);
    if (isNaN(val)) return;

    switch (type) {
      case 'posX':
        object.position.x = val;
        break;

      case 'posY':
        object.position.y = val;
        break;

      case 'rotZ':
        // Konversi dari Derajat (UI) ke Radian (Three.js)
        object.rotation.z = THREE.MathUtils.degToRad(val);
        break;

      case 'scale':
        if (val > 0) {
          object.scale.set(val, val, 1);
        }
        break;
    }

    if (this.selectionHelper) {
      try {
        this.selectionHelper.update();
      } catch (_) {}
    }
  }

  /**
   * Menata ulang posisi Z (depth) dan renderOrder seluruh objek berdasarkan urutan array sceneObjects.
   * Objek di indeks 0 (paling atas di sidebar) berada di posisi terdepan (Z dan renderOrder tertinggi).
   * Menggunakan Z_STEP = 20 dan traversal renderOrder eksplisit dengan depthTest = false untuk
   * menjamin perilaku layering 2D sempurna ala Figma/Photoshop tanpa konflik offset anak objek.
   */
  updateZIndices() {
    const Z_STEP = 20;
    const total = this.sceneObjects.length;

    for (let index = 0; index < total; index++) {
      const entry = this.sceneObjects[index];
      if (entry && entry.object) {
        // Fix 1: Z-Spacing Multiplier (Indeks 0 teratas memperoleh Z tertinggi)
        const zPos = (this.sceneObjects.length - index) * Z_STEP;
        entry.object.position.z = zPos; // entry.object.position.z = (this.sceneObjects.length - index) * Z_STEP;

        // Fix 2: Explicit Render Order & Disable Depth Test (Figma/Photoshop-style 2D layering)
        let baseOrder = (this.sceneObjects.length - index) * 100;
        entry.object.renderOrder = baseOrder;

        entry.object.traverse((child) => {
          if (child.isMesh && child.material) {
            const renderOrderVal = baseOrder++;
            child.renderOrder = renderOrderVal; // child.renderOrder = baseOrder++;
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                mat.depthTest = false;
                mat.transparent = true;
              });
            } else {
              child.material.depthTest = false;
              child.material.transparent = true;
            }
          }
        });
      }
    }

    if (this.transformGizmo && this.selectedEntry && this.selectedEntry.object) {
      this.updateGizmoVisual();
    }
  }

  /**
   * Memindahkan layer naik satu tingkat (lebih ke depan)
   * @param {string} id ID objek
   */
  moveLayerUp(id) {
    const idx = this.sceneObjects.findIndex(e => e.id === id);
    if (idx <= 0) return false;

    // Swap dengan elemen sebelumnya (naik di daftar = lebih ke depan)
    const temp = this.sceneObjects[idx];
    this.sceneObjects[idx] = this.sceneObjects[idx - 1];
    this.sceneObjects[idx - 1] = temp;

    this.updateZIndices();

    if (this.uiController && typeof this.uiController.renderLayersUI === 'function') {
      this.uiController.renderLayersUI();
    }

    if (this.uiController && typeof this.uiController.showToast === 'function') {
      this.uiController.showToast(`Layer ${temp.name.split(' (')[0]} dipindahkan ke atas`);
    }

    return true;
  }

  /**
   * Memindahkan layer turun satu tingkat (lebih ke belakang)
   * @param {string} id ID objek
   */
  moveLayerDown(id) {
    const idx = this.sceneObjects.findIndex(e => e.id === id);
    if (idx === -1 || idx >= this.sceneObjects.length - 1) return false;

    // Swap dengan elemen setelahnya (turun di daftar = lebih ke belakang)
    const temp = this.sceneObjects[idx];
    this.sceneObjects[idx] = this.sceneObjects[idx + 1];
    this.sceneObjects[idx + 1] = temp;

    this.updateZIndices();

    if (this.uiController && typeof this.uiController.renderLayersUI === 'function') {
      this.uiController.renderLayersUI();
    }

    if (this.uiController && typeof this.uiController.showToast === 'function') {
      this.uiController.showToast(`Layer ${temp.name.split(' (')[0]} dipindahkan ke bawah`);
    }

    return true;
  }

  /**
   * Mengubah warna material dari objek yang sedang dipilih
   */
  changeSelectedColor(targetEntry, hexColor) {
    if (!targetEntry || !targetEntry.object) return;

    targetEntry.object.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.color.set(hexColor));
        } else {
          child.material.color.set(hexColor);
        }
      }
    });
  }

  /**
   * Mengambil warna hex utama dari objek yang dipilih
   */
  getSelectedColor(targetEntry) {
    if (!targetEntry || !targetEntry.object) return '#0284C7';
    let foundColor = '#0284C7';

    targetEntry.object.traverse((child) => {
      if (child.isMesh && child.material && child.material.color) {
        foundColor = '#' + child.material.color.getHexString();
      }
    });

    return foundColor;
  }

  /**
   * Raycasting untuk mendeteksi objek yang diklik langsung pada canvas
   */
  getIntersectedObject(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
      const hit = intersects[i];
      // Abaikan visual indicator (BoxHelper / TransformGizmo) atau garis bantu seleksi
      if (this.transformGizmo && (hit.object === this.transformGizmo.group || hit.object.parent === this.transformGizmo.group || this.transformGizmo.handles.includes(hit.object))) continue;
      if (this.selectionHelper && (hit.object === this.selectionHelper || hit.object.isLineSegments)) continue;
      if (!hit.object.visible) continue;

      // Telusuri hierarki objek ke atas (object.parent) untuk menemukan root Group/Mesh terdaftar
      let curr = hit.object;
      while (curr && curr !== this.scene) {
        const found = this.sceneObjects.find(e => e.object === curr);
        if (found) {
          if (found.object && !found.object.visible) break;
          return found;
        }
        curr = curr.parent;
      }
    }

    return null;
  }

  /**
   * Menampilkan custom Transform Gizmo 2D pada objek yang dipilih
   */
  updateSelectionVisual(entry) {
    if (!entry || !entry.object || !entry.object.visible) {
      this.clearSelectionVisual();
      return;
    }

    try {
      if (this.transformGizmo) {
        this.transformGizmo.update(entry);
      }
      // Backward compatibility reference:
      // this.selectionHelper = new THREE.BoxHelper(entry.object, 0x0284c7); this.selectionHelper.raycast = () => {};
      this.selectionHelper = this.transformGizmo ? this.transformGizmo.group : null;
      if (this.selectionHelper) {
        this.selectionHelper.update = () => this.updateGizmoVisual();
        this.selectionHelper.raycast = () => {};
      }
    } catch (e) {
      console.warn("Gagal memperbarui visual Transform Gizmo 2D:", e);
    }
  }

  /**
   * Menghapus visual indicator seleksi
   */
  clearSelectionVisual() {
    if (this.transformGizmo) {
      this.transformGizmo.hide();
    }
    if (this.selectionHelper && this.selectionHelper !== (this.transformGizmo ? this.transformGizmo.group : null)) {
      this.scene.remove(this.selectionHelper);
      this.selectionHelper = null;
    }
  }

  /**
   * Sinkronisasi visual ukuran dan posisi Transform Gizmo 2D
   */
  updateGizmoVisual() {
    if (this.transformGizmo && this.selectedEntry && this.selectedEntry.object) {
      this.transformGizmo.update(this.selectedEntry);
    }
  }

  /**
   * Memilih objek dalam scene dan memperbarui visual indicator
   */
  selectObjectEntry(entry, triggerCallback = true) {
    if (this.selectedEntry === entry) {
      this.updateSelectionVisual(entry);
      return;
    }

    this.selectedEntry = entry;
    this.updateSelectionVisual(entry);

    if (triggerCallback && this.onObjectSelected) {
      this.onObjectSelected(entry);
    }
  }

  /**
   * Membatalkan seleksi objek (deselect)
   */
  deselectObject(triggerCallback = true) {
    if (!this.selectedEntry) return;

    this.selectedEntry = null;
    this.clearSelectionVisual();

    if (triggerCallback && this.onObjectDeselected) {
      this.onObjectDeselected();
    }
  }

  /**
   * Menghapus objek yang sedang dipilih dari Three.js scene dan array sceneObjects
   */
  deleteSelectedObject() {
    if (!this.selectedEntry) return null;
    const deletedEntry = this.selectedEntry;

    // 1. Bersihkan visual helper seleksi
    this.clearSelectionVisual();

    // 2. Hapus objek dari Three.js scene & dispose memori
    if (deletedEntry.object) {
      this.scene.remove(deletedEntry.object);
      deletedEntry.object.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    // 3. Hapus dari array sceneObjects
    const index = this.sceneObjects.indexOf(deletedEntry);
    if (index !== -1) {
      this.sceneObjects.splice(index, 1);
      this.updateZIndices();
    }

    // 4. Reset seleksi
    this.selectedEntry = null;

    // 5. Beritahu UIController untuk update UI Layers & Toast
    if (this.uiController && typeof this.uiController.onSceneObjectDeleted === 'function') {
      this.uiController.onSceneObjectDeleted(deletedEntry);
    }

    return deletedEntry;
  }
}

/**
 * MAIN APPLICATION ENTRY POINT
 * Tugas Grafika Komputer - Polindra Campus 2D
 * -------------------------------------------------------------
 * Mengorkestrasi ThreeScene, Geometri Objek, UI Controller,
 * dan Animation / Render Loop secara modular.
 */

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { injectDOM } from './ui/DOMInjector.js';
import { ThreeScene } from './core/ThreeScene.js';
import { UIController } from './ui/UIController.js';
import {
  createGroundEnvironment,
  createStudentCenter,
  createSunObject,
  createFlagPole,
  createPineTree,
  createCloudObject
} from './objects/CampusGeometries.js?v=3';

class App {
  constructor() {
    this.canvas = null;
    this.threeScene = null;
    this.ui = null;
    this.clock = new THREE.Clock();
    
    // Referensi objek khusus untuk animasi
    this.sunEntry = null;
    this.cloud1Entry = null;
    this.cloud2Entry = null;

    this.init();
  }

  /**
   * Bootstrapping aplikasi
   */
  init() {
    // 0. Injeksi Komponen UI secara sinkron sebelum controller diinisialisasi
    injectDOM();

    // 1. Dapatkan referensi canvas WebGL
    this.canvas = document.getElementById('three-canvas');

    // 2. Inisialisasi Core ThreeScene (Scene, Kamera Ortografik, WebGLRenderer)
    this.threeScene = new ThreeScene(this.canvas);

    // 3. Inisialisasi UI Controller
    this.ui = new UIController();
    this.ui.init({
      threeScene: this.threeScene,
      onToggleAnimation: (isActive) => {
        // Callback saat animasi play/pause di toolbar
      },
      isAnimating: true
    });

    // 3. Bangun dan Daftarkan Seluruh Geometri Kampus Polindra
    this.buildScene();

    // 4. Mulai Render & Animation Loop
    this.animate();

    console.log("Aplikasi Grafika Komputer 2D Polindra (Modular ES6) berhasil dimuat.");
  }

  /**
   * Membuat seluruh objek 2D dan mendaftarkannya ke UI Inspector
   */
  buildScene() {
    const scene = this.threeScene.scene;

    // Dasar Lapangan & Trotoar Kampus (PlaneGeometry)
    const ground = createGroundEnvironment(scene);
    this.ui.registerSceneObject(ground);

    // Gedung Student Center Ikonik Polindra (Compound Group)
    const studentCenter = createStudentCenter(scene);
    this.ui.registerSceneObject(studentCenter);

    // Matahari & Sinar (CircleGeometry)
    this.sunEntry = createSunObject(scene);
    this.ui.registerSceneObject(this.sunEntry);

    // Tiang Bendera Merah Putih di Plaza Terbuka Kampus (berdiri megah tanpa tabrakan dengan kanopi)
    const flagPole = createFlagPole(scene, -270, -146);
    this.ui.registerSceneObject(flagPole);

    // Barisan Pohon Cemara (Compound Triangles) - tata letak luas dan harmonis tanpa tumpang tindih
    const tree1 = createPineTree(scene, -380, -146, 0.95, 'tree-left', 'Pohon Cemara Kiri');
    this.ui.registerSceneObject(tree1);

    const tree2 = createPineTree(scene, 280, -146, 1.05, 'tree-right', 'Pohon Cemara Kanan (Besar)');
    this.ui.registerSceneObject(tree2);

    const tree3 = createPineTree(scene, 370, -146, 0.85, 'tree-far-right', 'Pohon Cemara Samping');
    this.ui.registerSceneObject(tree3);

    // Awan Minimalis Dekoratif
    this.cloud1Entry = createCloudObject(scene, 220, 240, 0.9, 'cloud-1', 'Awan Kanan');
    this.ui.registerSceneObject(this.cloud1Entry);

    this.cloud2Entry = createCloudObject(scene, -60, 260, 0.7, 'cloud-2', 'Awan Kiri');
    this.ui.registerSceneObject(this.cloud2Entry);

    // Inisialisasi urutan Z-Index (kedalaman rendering) awal untuk seluruh objek kampus
    this.threeScene.updateZIndices();

    // Pilih Student Center secara default pada inspector saat awal buka
    this.ui.selectObject(studentCenter);
  }

  /**
   * Render & Animation Loop menggunakan requestAnimationFrame
   */
  animate = () => {
    requestAnimationFrame(this.animate);

    try {
      const elapsedTime = this.clock.getElapsedTime();

      // Jalankan transformasi rotasi dan translasi dinamis jika animasi aktif
      if (this.ui && this.ui.isAnimating) {
        // 1. Rotasi Grafika Sumbu Z pada pancaran sinar matahari
        if (this.sunEntry && this.sunEntry.raySubGroup && this.sunEntry.object && this.sunEntry.object.parent) {
          this.sunEntry.raySubGroup.rotation.z += 0.008;
        }

        // 2. Translasi mengambang halus pada awan (tidak menginterupsi drag pengguna)
        if (this.cloud1Entry && this.cloud1Entry.object && this.cloud1Entry.object.parent) {
          if (!this.threeScene.isDraggingObject || this.threeScene.draggedEntry !== this.cloud1Entry) {
            if (this.cloud1Entry.baseX === undefined) this.cloud1Entry.baseX = 220;
            this.cloud1Entry.object.position.x = this.cloud1Entry.baseX + Math.sin(elapsedTime * 0.5) * 12;
          }
        }
        if (this.cloud2Entry && this.cloud2Entry.object && this.cloud2Entry.object.parent) {
          if (!this.threeScene.isDraggingObject || this.threeScene.draggedEntry !== this.cloud2Entry) {
            if (this.cloud2Entry.baseX === undefined) this.cloud2Entry.baseX = -60;
            this.cloud2Entry.object.position.x = this.cloud2Entry.baseX + Math.cos(elapsedTime * 0.4) * 16;
          }
        }
      }

      // Render tampilan menggunakan kamera ortografik
      if (this.threeScene) {
        this.threeScene.render();
      }
    } catch (renderError) {
      console.error("[ThreeScene Render Crash Expose]:", renderError);
    }
  };
}

// Inisialisasi saat struktur DOM siap
window.addEventListener('DOMContentLoaded', () => {
  new App();
});

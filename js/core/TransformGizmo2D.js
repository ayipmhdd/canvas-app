/**
 * TRANSFORM GIZMO 2D
 * Custom Figma & Canva-style 2D Transform Gizmo for Three.js
 * -------------------------------------------------------------
 * Provides an interactive bounding box with:
 * - 4 Corner Handles for intuitive scaling
 * - 1 Top Dongle Handle for direct rotation
 * - Scale Independence: handles remain fixed screen-pixel size regardless of zoom/scale
 * - renderOrder = 999 and depthTest = false for top rendering
 */

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class TransformGizmo2D {
  /**
   * @param {THREE.Scene} scene 
   * @param {THREE.Camera} camera 
   * @param {Function} getUnitsPerPixel Callback untuk rasio piksel ke koordinat dunia
   */
  constructor(scene, camera, getUnitsPerPixel) {
    this.scene = scene;
    this.camera = camera;
    this.getUnitsPerPixel = getUnitsPerPixel;

    // Root Group Gizmo
    this.group = new THREE.Group();
    this.group.name = 'transformGizmo';
    this.group.visible = false;
    this.group.renderOrder = 999;

    // Daftar mesh interaktif untuk hit testing Raycaster
    this.handles = [];

    this.initElements();
    this.scene.add(this.group);
  }

  /**
   * Inisialisasi komponen visual gizmo: Bounding Box, Stem Line, dan Handles
   */
  initElements() {
    // 1. Bounding Box Outline (LineLoop dengan 4 titik sudut)
    this.boxGeometry = new THREE.BufferGeometry();
    const boxPositions = new Float32Array(12); // 4 sudut x 3 koordinat
    this.boxGeometry.setAttribute('position', new THREE.BufferAttribute(boxPositions, 3));
    this.boxMaterial = new THREE.LineBasicMaterial({
      color: 0x0284c7, // Biru Polindra / Figma Blue
      depthTest: false,
      depthWrite: false,
      transparent: true,
      linewidth: 1.5
    });
    this.boxLine = new THREE.LineLoop(this.boxGeometry, this.boxMaterial);
    this.boxLine.renderOrder = 999;
    this.boxLine.raycast = () => {}; // Mencegah raycaster menabrak garis outline
    this.group.add(this.boxLine);

    // 2. Batang Tangkai Rotasi (Stem Line vertikal dari tepi atas ke handle rotasi)
    this.stemGeometry = new THREE.BufferGeometry();
    const stemPositions = new Float32Array(6); // 2 titik x 3 koordinat
    this.stemGeometry.setAttribute('position', new THREE.BufferAttribute(stemPositions, 3));
    this.stemMaterial = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      linewidth: 1.5
    });
    this.stemLine = new THREE.Line(this.stemGeometry, this.stemMaterial);
    this.stemLine.renderOrder = 999;
    this.stemLine.raycast = () => {};
    this.group.add(this.stemLine);

    // 3. Empat Handle Sudut Skala (Top-Left, Top-Right, Bottom-Right, Bottom-Left)
    this.handleTL = this.createHandle('handle-scale', 'scale', 'tl');
    this.handleTR = this.createHandle('handle-scale', 'scale', 'tr');
    this.handleBR = this.createHandle('handle-scale', 'scale', 'br');
    this.handleBL = this.createHandle('handle-scale', 'scale', 'bl');

    // 4. Satu Handle Dongle Rotasi di bagian atas tengah
    this.handleRotate = this.createHandle('handle-rotate', 'rotate', 'top');
  }

  /**
   * Membuat satu handle interaktif (lingkaran putih dengan border biru ala Canva/Figma)
   * @param {string} name Nama handle untuk identifikasi raycaster
   * @param {string} type 'scale' | 'rotate'
   * @param {string} corner 'tl' | 'tr' | 'br' | 'bl' | 'top'
   */
  createHandle(name, type, corner) {
    const handleGroup = new THREE.Group();
    handleGroup.name = name;
    handleGroup.userData = {
      isHandle: true,
      handleType: type,
      corner: corner
    };
    handleGroup.renderOrder = 999;

    // A. Lingkaran Putih Bagian Dalam (Isi)
    const fillGeom = new THREE.CircleGeometry(1.0, 24);
    const fillMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
    const fillMesh = new THREE.Mesh(fillGeom, fillMat);
    fillMesh.name = name;
    fillMesh.userData = handleGroup.userData;
    fillMesh.renderOrder = 1000;
    handleGroup.add(fillMesh);

    // B. Garis Pinggir Biru (Border)
    const borderGeom = new THREE.BufferGeometry();
    const borderPts = [];
    const segments = 24;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      borderPts.push(Math.cos(theta), Math.sin(theta), 0.05);
    }
    borderGeom.setAttribute('position', new THREE.Float32BufferAttribute(borderPts, 3));
    const borderMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      linewidth: 2
    });
    const borderLine = new THREE.LineLoop(borderGeom, borderMat);
    borderLine.renderOrder = 1001;
    borderLine.raycast = () => {};
    handleGroup.add(borderLine);

    // C. Khusus handle rotasi: Titik aksen biru di tengah
    if (type === 'rotate') {
      const centerDotGeom = new THREE.CircleGeometry(0.35, 16);
      const centerDotMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        depthTest: false,
        depthWrite: false,
        transparent: true
      });
      const centerDotMesh = new THREE.Mesh(centerDotGeom, centerDotMat);
      centerDotMesh.position.z = 0.06;
      centerDotMesh.renderOrder = 1002;
      centerDotMesh.raycast = () => {};
      handleGroup.add(centerDotMesh);
    }

    // D. Area klik tak terlihat (Hit Target) lebih luas agar mudah diklik (forgiving radius)
    const hitGeom = new THREE.CircleGeometry(1.6, 12);
    const hitMat = new THREE.MeshBasicMaterial({
      visible: false,
      depthTest: false
    });
    const hitMesh = new THREE.Mesh(hitGeom, hitMat);
    hitMesh.name = name;
    hitMesh.userData = handleGroup.userData;
    handleGroup.add(hitMesh);

    this.group.add(handleGroup);

    // Daftarkan ke array handles untuk deteksi raycaster
    this.handles.push(hitMesh);
    this.handles.push(fillMesh);

    return handleGroup;
  }

  /**
   * Menghitung batas lokal (local bounding box) objek tanpa dipengaruhi rotasi atau skala objek
   * Menggunakan caching internal untuk performa optimal 60 FPS
   */
  computeLocalBounds(obj) {
    if (obj.userData && obj.userData.__localBounds) {
      return obj.userData.__localBounds;
    }

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let hasVertices = false;

    if (obj.isMesh && obj.geometry) {
      if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
      const box = obj.geometry.boundingBox;
      if (box) {
        minX = box.min.x;
        maxX = box.max.x;
        minY = box.min.y;
        maxY = box.max.y;
        hasVertices = true;
      }
    } else {
      obj.updateWorldMatrix(true, true);
      const invRootWorld = obj.matrixWorld.clone().invert();

      obj.traverse((child) => {
        if (child.isMesh && child.geometry) {
          if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
          const b = child.geometry.boundingBox;
          if (!b) return;

          const toRoot = invRootWorld.clone().multiply(child.matrixWorld);
          const corners = [
            new THREE.Vector3(b.min.x, b.min.y, 0),
            new THREE.Vector3(b.min.x, b.max.y, 0),
            new THREE.Vector3(b.max.x, b.min.y, 0),
            new THREE.Vector3(b.max.x, b.max.y, 0)
          ];

          for (const pt of corners) {
            pt.applyMatrix4(toRoot);
            if (pt.x < minX) minX = pt.x;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.y > maxY) maxY = pt.y;
            hasVertices = true;
          }
        }
      });
    }

    if (!hasVertices || !isFinite(minX) || !isFinite(maxX) || minX === maxX) {
      minX = -35;
      maxX = 35;
      minY = -35;
      maxY = 35;
    }

    // Minimum visual size (24x24) agar garis/objek tipis tetap memiliki handle yang nyaman dimanipulasi
    const width = maxX - minX;
    const height = maxY - minY;
    if (width < 24) {
      const pad = (24 - width) / 2;
      minX -= pad;
      maxX += pad;
    }
    if (height < 24) {
      const pad = (24 - height) / 2;
      minY -= pad;
      maxY += pad;
    }

    const bounds = { minX, maxX, minY, maxY };
    if (obj.userData) {
      obj.userData.__localBounds = bounds;
    }
    return bounds;
  }

  /**
   * Update ukuran dan posisi gizmo agar presisi mengikuti objek terpilih
   * @param {Object} entry Selected object entry
   */
  update(entry) {
    if (!entry || !entry.object || !entry.object.visible) {
      this.group.visible = false;
      return;
    }

    const obj = entry.object;
    this.group.visible = true;

    // 1. Tempatkan gizmo pada posisi objek dan cocokkan rotasi Z-nya
    const objZ = (!isNaN(obj.position.z)) ? obj.position.z : 0;
    this.group.position.set(obj.position.x, obj.position.y, objZ + 0.5);
    this.group.rotation.z = obj.rotation.z;

    // Pastikan seluruh elemen gizmo selalu render di layer paling depan terlepas dari jumlah layer scene
    const topRenderOrder = Math.max(99999, (obj.renderOrder || 0) + 1000);
    this.group.renderOrder = topRenderOrder;
    this.boxLine.renderOrder = topRenderOrder;
    this.stemLine.renderOrder = topRenderOrder;
    this.group.traverse((c) => {
      if (c.isMesh || c.isLine) {
        c.renderOrder = topRenderOrder + 10;
      }
    });

    // Gizmo group selalu berskala 1 agar bentuk handle tidak lonjong saat objek diskala non-uniform
    this.group.scale.set(1, 1, 1);

    // 2. Dapatkan batas lokal objek
    const bounds = this.computeLocalBounds(obj);
    const unitsPerPixel = (typeof this.getUnitsPerPixel === 'function') ? this.getUnitsPerPixel() : 1;

    const scaleX = (obj.scale && !isNaN(obj.scale.x)) ? Math.abs(obj.scale.x) : 1;
    const scaleY = (obj.scale && !isNaN(obj.scale.y)) ? Math.abs(obj.scale.y) : 1;

    // Ukuran bounding box dalam koordinat lokal gizmo
    const halfW = ((bounds.maxX - bounds.minX) / 2) * scaleX;
    const halfH = ((bounds.maxY - bounds.minY) / 2) * scaleY;
    const centerX = ((bounds.minX + bounds.maxX) / 2) * scaleX;
    const centerY = ((bounds.minY + bounds.maxY) / 2) * scaleY;

    const x1 = centerX - halfW;
    const x2 = centerX + halfW;
    const y1 = centerY - halfH;
    const y2 = centerY + halfH;

    // 3. Update geometri Bounding Box Outline (4 sudut: TL, TR, BR, BL)
    const boxPos = this.boxGeometry.attributes.position.array;
    boxPos[0] = x1; boxPos[1] = y2; boxPos[2] = 0; // TL
    boxPos[3] = x2; boxPos[4] = y2; boxPos[5] = 0; // TR
    boxPos[6] = x2; boxPos[7] = y1; boxPos[8] = 0; // BR
    boxPos[9] = x1; boxPos[10] = y1; boxPos[11] = 0; // BL
    this.boxGeometry.attributes.position.needsUpdate = true;

    // 4. Update Stem Line Tangkai Rotasi (Panjang 26 pixel layar konstan)
    const stemLength = 26 * unitsPerPixel;
    const stemPos = this.stemGeometry.attributes.position.array;
    stemPos[0] = centerX; stemPos[1] = y2; stemPos[2] = 0;
    stemPos[3] = centerX; stemPos[4] = y2 + stemLength; stemPos[5] = 0;
    this.stemGeometry.attributes.position.needsUpdate = true;

    // 5. Update Posisi & Skala Handle (Rule 1: Gizmo Scale Independence)
    // Titik handle selalu berukuran pixel tetap di layar terlepas dari zoom kamera maupun skala objek
    const cornerRadius = 6.5 * unitsPerPixel;
    const rotRadius = 7.5 * unitsPerPixel;

    this.handleTL.position.set(x1, y2, 0.1);
    this.handleTL.scale.set(cornerRadius, cornerRadius, 1);

    this.handleTR.position.set(x2, y2, 0.1);
    this.handleTR.scale.set(cornerRadius, cornerRadius, 1);

    this.handleBR.position.set(x2, y1, 0.1);
    this.handleBR.scale.set(cornerRadius, cornerRadius, 1);

    this.handleBL.position.set(x1, y1, 0.1);
    this.handleBL.scale.set(cornerRadius, cornerRadius, 1);

    this.handleRotate.position.set(centerX, y2 + stemLength, 0.1);
    this.handleRotate.scale.set(rotRadius, rotRadius, 1);
  }

  /**
   * Sembunyikan gizmo
   */
  hide() {
    this.group.visible = false;
  }

  /**
   * Bersihkan resource geometri dan material dari memori
   */
  dispose() {
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    });
  }
}

/**
 * CAMPUS GEOMETRIES & SHAPES MODULE
 * Tugas Grafika Komputer - Polindra Campus 2D
 * -------------------------------------------------------------
 * Menyediakan fungsi-fungsi modular pembuatan geometri:
 *   1. THREE.CircleGeometry (Matahari, Aksen Sinar, Awan)
 *   2. THREE.PlaneGeometry (Gedung Utama, Jendela, Portal Pintu, Fondasi, Bendera, Lapangan)
 *   3. Segitiga via THREE.CircleGeometry(radius, 3, Math.PI / 2) (Atap Limas Pedimen & Pohon Cemara)
 *   4. THREE.ShapeGeometry (Gedung Ikonik Menara Polindra kustom)
 */

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { PALETTE } from '../config/Palette.js';

/**
 * GEOMETRI 1: LINGKARAN (CircleGeometry)
 * Objek: Matahari Kampus Polindra dengan Pancaran Sinar Rotatif
 */
export function createSunObject(scene) {
  const sunGroup = new THREE.Group();
  sunGroup.name = "Matahari & Sinar";

  // Lingkaran Inti Matahari
  const sunGeom = new THREE.CircleGeometry(42, 36);
  const sunMat = new THREE.MeshBasicMaterial({ color: PALETTE.sun });
  const sunMesh = new THREE.Mesh(sunGeom, sunMat);
  sunGroup.add(sunMesh);

  // Pancaran Sinar (Rays) dibuat menggunakan segitiga dengan Rotasi Z berkala
  const rayGroup = new THREE.Group();
  rayGroup.name = "RaysGroup";
  const rayCount = 8;
  for (let i = 0; i < rayCount; i++) {
    // Segitiga sinar menggunakan CircleGeometry dengan 3 segmen
    const rayGeom = new THREE.CircleGeometry(10, 3);
    const rayMat = new THREE.MeshBasicMaterial({ color: PALETTE.sunRays });
    const rayMesh = new THREE.Mesh(rayGeom, rayMat);
    
    const angle = (i * Math.PI * 2) / rayCount;
    const radiusDist = 58;
    
    // Translasi posisi sinar melingkar
    rayMesh.position.set(Math.cos(angle) * radiusDist, Math.sin(angle) * radiusDist, 0);
    // Rotasi Z agar ujung segitiga mengarah ke luar
    rayMesh.rotation.z = angle - Math.PI / 2;
    // Scaling sedikit memanjang
    rayMesh.scale.set(0.7, 1.4, 1);
    
    rayGroup.add(rayMesh);
  }
  sunGroup.add(rayGroup);

  // Penerapan Transformasi pada Group Matahari:
  // 1. Translasi ke pojok kiri atas scene
  sunGroup.position.set(-270, 220, 0);
  // 2. Scaling proporsional
  sunGroup.scale.set(1.0, 1.0, 1);

  scene.add(sunGroup);

  return {
    id: 'sun',
    name: 'Matahari (CircleGeometry)',
    icon: '☀️',
    type: 'CircleGeometry',
    object: sunGroup,
    animated: true,
    raySubGroup: rayGroup
  };
}

/**
 * DEKORASI: AWAN MINIMALIS
 * Menggabungkan beberapa CircleGeometry dengan transformasi Translasi & Scaling
 */
export function createCloudObject(scene, posX, posY, scaleVal, idName, labelName) {
  const cloudGroup = new THREE.Group();
  cloudGroup.name = labelName;

  const circleMat = new THREE.MeshBasicMaterial({ color: PALETTE.cloudWhite });
  
  // Bulatan-bulatan awan dengan berbagai ukuran dan posisi
  const parts = [
    { r: 24, x: 0, y: 0 },
    { r: 32, x: 22, y: 8 },
    { r: 22, x: 48, y: 0 },
    { r: 16, x: -16, y: -4 },
    { r: 18, x: 38, y: -6 }
  ];

  parts.forEach(p => {
    const geom = new THREE.CircleGeometry(p.r, 24);
    const mesh = new THREE.Mesh(geom, circleMat);
    mesh.position.set(p.x, p.y, 0);
    cloudGroup.add(mesh);
  });

  // Transformasi Translasi & Scaling
  cloudGroup.position.set(posX, posY, 0);
  cloudGroup.scale.set(scaleVal, scaleVal, 1);

  scene.add(cloudGroup);

  return {
    id: idName,
    name: labelName,
    icon: '☁️',
    type: 'Circle (Compound)',
    object: cloudGroup
  };
}

/**
 * GEOMETRI UTAMA: GEDUNG STUDENT CENTER POLINDRA (Compound 2D Vector Art)
 * Fasad arsitektur realistis Student Center Politeknik Negeri Indramayu:
 *   - Part 1 (Right Tower): Dinding menara putih (scWhite), aksen bilah kuning (scYellow), dan 5 jendela celah (scDarkWindow).
 *   - Part 2 (Central Glass Tower): Fasad kaca cyan (scGlass), mullion & pylon vertikal navy (scNavy), dan parapet atap putih.
 *   - Part 3 (Left Canopy & Stripes): Kanopi miring navy via THREE.ShapeGeometry dan garis louver horizontal perak (scSilver).
 *   - Part 4 (Logo Polindra): Lambang bulat melingkar kuning & navy di pylon vertikal kaca.
 */
/**
 * GEOMETRI UTAMA: GEDUNG STUDENT CENTER POLINDRA (High-Fidelity 2D Vector Art)
 * Rekonstruksi arsitektur akurat Gedung Student Center Politeknik Negeri Indramayu:
 *   1. Part 1 (Right Tower Block): Dinding menara beton putih 6 lantai (scWhite),
 *      kisi louver bertingkat (scDarkWindow), 5 jendela celah horisontal,
 *      dan bilah kolom kuning cerah ikonik (scYellow) yang membingkai sudut kanan atas.
 *   2. Part 2 (Central Glass Tower): Fasad kaca megah biru cyan reflektif (scGlass),
 *      garis spandrel 6 lantai, pylon struktural navy vertikal (scNavy),
 *      jalur pipa aksen sirkuit/conduit perak bertingkat (scSilver),
 *      dan lambang resmi bulat Polindra (emas & navy).
 *   3. Part 3 (Left Drop-off Portico & Canopy): Sayap mezzanine lantai 2,
 *      tiang miring portico kokoh arang gelap, kanopi cantilever navy,
 *      4 garis louver perak berbelok sudut 45 derajat (scSilver),
 *      fasad lobi kaca lantai dasar, serta plat tulisan "STUDENT CENTER".
 *   4. Part 4 (Landscaping & Plinth): Podium fondasi slate gelap serta
 *      taman semak hijau tropis di depan lobi utama.
 */
export function createStudentCenter(scene) {
  const studentCenterGroup = new THREE.Group();
  studentCenterGroup.name = "Student Center";

  // Palette references
  const cNavy = PALETTE.scNavy;         // 0x1E3A8A
  const cGlass = PALETTE.scGlass;       // 0x0EA5E9
  const cYellow = PALETTE.scYellow;     // 0xEAB308
  const cWhite = PALETTE.scWhite;       // 0xF8FAFC
  const cSilver = PALETTE.scSilver;     // 0x94A3B8
  const cDarkWin = PALETTE.scDarkWindow;// 0x475569

  // =========================================================================
  // 0. FONDASI DASAR & PODIUM (Plinth & Ground Curb)
  // =========================================================================
  const basePlinthGeom = new THREE.PlaneGeometry(450, 10);
  const basePlinthMat = new THREE.MeshBasicMaterial({ color: 0x1E293B });
  const basePlinth = new THREE.Mesh(basePlinthGeom, basePlinthMat);
  basePlinth.position.set(0, 5, 0.01);
  studentCenterGroup.add(basePlinth);

  const curbGeom = new THREE.PlaneGeometry(454, 3);
  const curbMat = new THREE.MeshBasicMaterial({ color: 0x94A3B8 });
  const curb = new THREE.Mesh(curbGeom, curbMat);
  curb.position.set(0, 10, 0.02);
  studentCenterGroup.add(curb);

  // =========================================================================
  // 1. PART 1: RIGHT WING & YELLOW FIN (MENARA SAYAP KANAN & BILAH KUNING)
  // =========================================================================
  // A. Sayap Gedung Samping Belakang (Right Annex Wing di belakang menara kuning)
  const annexGeom = new THREE.PlaneGeometry(36, 175);
  const annexMat = new THREE.MeshBasicMaterial({ color: 0xE2E8F0 });
  const annexMesh = new THREE.Mesh(annexGeom, annexMat);
  annexMesh.position.set(208, 92, 0.01);
  studentCenterGroup.add(annexMesh);

  // Jendela pita horisontal pada sayap belakang
  for (let w = 0; w < 5; w++) {
    const aWinGeom = new THREE.PlaneGeometry(30, 14);
    const aWinMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    const aWin = new THREE.Mesh(aWinGeom, aWinMat);
    aWin.position.set(208, 30 + w * 32, 0.02);
    studentCenterGroup.add(aWin);
  }

  // B. Dinding Menara Putih Utama (Right Tower White Base)
  const rightTowerGeom = new THREE.PlaneGeometry(92, 264); // new THREE.PlaneGeometry(85, 260)
  const rightTowerMat = new THREE.MeshBasicMaterial({ color: PALETTE.scWhite });
  const rightTowerMesh = new THREE.Mesh(rightTowerGeom, rightTowerMat);
  rightTowerMesh.position.set(118, 137, 0.03);
  studentCenterGroup.add(rightTowerMesh);

  // C. Struktur Kisi Louver Bertingkat Menara Kanan (6 Tingkat Arsitektural)
  const louverDarkMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
  const louverSlatMat = new THREE.MeshBasicMaterial({ color: 0x64748B });
  const tierCount = 6;
  const tierHeight = 28;
  const tierStartY = 38;
  for (let i = 0; i < tierCount; i++) {
    const yCenter = tierStartY + i * 40;
    
    // Ceruk jendela gelap
    const recessGeom = new THREE.PlaneGeometry(44, tierHeight);
    const recessMesh = new THREE.Mesh(recessGeom, louverDarkMat);
    recessMesh.position.set(96, yCenter, 0.05);
    studentCenterGroup.add(recessMesh);

    // Kisi-kisi horizontal louver
    for (let s = -1; s <= 1; s++) {
      const slatGeom = new THREE.PlaneGeometry(42, 3);
      const slatMesh = new THREE.Mesh(slatGeom, louverSlatMat);
      slatMesh.position.set(96, yCenter + s * 8, 0.07);
      studentCenterGroup.add(slatMesh);
    }
  }

  // Kolom vertikal putih pembatas louver
  const louverColGeom = new THREE.PlaneGeometry(6, 252);
  const louverCol = new THREE.Mesh(louverColGeom, rightTowerMat);
  louverCol.position.set(73, 137, 0.08);
  studentCenterGroup.add(louverCol);

  // D. 5 Jendela Celah Gelap Vertikal (Slit Windows on Right White Wall)
  const slitGeom = new THREE.PlaneGeometry(24, 6.5);
  const slitMat = new THREE.MeshBasicMaterial({ color: PALETTE.scDarkWindow });
  const slitYs = [58, 98, 138, 178, 218];
  slitYs.forEach((sy) => {
    const slitMesh = new THREE.Mesh(slitGeom, slitMat);
    slitMesh.position.set(142, sy, 0.08);
    studentCenterGroup.add(slitMesh);

    // Lis bingkai putih tipis di atas celah
    const slitTrimGeom = new THREE.PlaneGeometry(26, 1.5);
    const slitTrim = new THREE.Mesh(slitTrimGeom, new THREE.MeshBasicMaterial({ color: 0xCBD5E1 }));
    slitTrim.position.set(142, sy + 4.5, 0.09);
    studentCenterGroup.add(slitTrim);
  });

  // E. Bilah Kolom Kuning Ikonik (Polindra Yellow Architectural Fin / Crown)
  // Bentuk L-crown modern di tepi kanan fasad yang menjadi ciri khas utama kampus
  const yellowShape = new THREE.Shape();
  yellowShape.moveTo(158, 10);
  yellowShape.lineTo(192, 10);
  yellowShape.lineTo(192, 274);
  yellowShape.lineTo(158, 282); // Puncak miring dinamis
  yellowShape.closePath();

  const yellowGeom = new THREE.ShapeGeometry(yellowShape);
  const yellowMat = new THREE.MeshBasicMaterial({ color: PALETTE.scYellow });
  const yellowMesh = new THREE.Mesh(yellowGeom, yellowMat);
  yellowMesh.position.set(0, 0, 0.10);
  studentCenterGroup.add(yellowMesh);

  // Aksen garis lis putih di sisi dalam kolom kuning
  const yellowInnerLineGeom = new THREE.PlaneGeometry(2, 260);
  const yellowInnerLine = new THREE.Mesh(yellowInnerLineGeom, new THREE.MeshBasicMaterial({ color: 0xFEF08A }));
  yellowInnerLine.position.set(162, 142, 0.12);
  studentCenterGroup.add(yellowInnerLine);


  // =========================================================================
  // 2. PART 2: CENTRAL GLASS CURTAIN WALL (MENARA KACA CYAN & PYLON NAVY)
  // =========================================================================
  // A. Fasad Kaca Reflektif Cyan Utama
  const glassWidth = 172;
  const glassHeight = 256;
  const glassGeom = new THREE.PlaneGeometry(glassWidth, glassHeight);
  const glassMat = new THREE.MeshBasicMaterial({ color: PALETTE.scGlass, transparent: true, opacity: 0.94 });
  const glassMesh = new THREE.Mesh(glassGeom, glassMat);
  glassMesh.position.set(-15, 138, 0.03);
  studentCenterGroup.add(glassMesh);

  // B. Garis Lantai Spandrel Horisontal (6 Lantai Bangunan Kaca)
  const spandrelMat = new THREE.MeshBasicMaterial({ color: 0x0284C7 });
  for (let fl = 1; fl <= 5; fl++) {
    const spGeom = new THREE.PlaneGeometry(glassWidth - 4, 3);
    const spMesh = new THREE.Mesh(spGeom, spandrelMat);
    spMesh.position.set(-15, 10 + fl * 42, 0.05);
    studentCenterGroup.add(spMesh);
  }

  // C. Mullion & Frame Vertikal Navy
  const navyMat = new THREE.MeshBasicMaterial({ color: PALETTE.scNavy });

  // Bingkai tepi kaca
  const leftGlassFrameGeom = new THREE.PlaneGeometry(7, glassHeight + 2);
  const leftGlassFrame = new THREE.Mesh(leftGlassFrameGeom, navyMat);
  leftGlassFrame.position.set(-98, 138, 0.08);
  studentCenterGroup.add(leftGlassFrame);

  const rightGlassFrameGeom = new THREE.PlaneGeometry(6, glassHeight + 2);
  const rightGlassFrame = new THREE.Mesh(rightGlassFrameGeom, navyMat);
  rightGlassFrame.position.set(68, 138, 0.08);
  studentCenterGroup.add(rightGlassFrame);

  // Mullion pembagi panel kaca tipis
  const vertMullionPositions = [-78, -58, -38, 18, 42];
  vertMullionPositions.forEach((mx) => {
    const mulGeom = new THREE.PlaneGeometry(2.5, glassHeight);
    const mulMesh = new THREE.Mesh(mulGeom, navyMat);
    mulMesh.position.set(mx, 138, 0.07);
    studentCenterGroup.add(mulMesh);
  });

  // D. Pylon Vertikal Navy Utama (Main Central Navy Feature Column)
  // Menara kolom struktural navy di tengah-kiri fasad kaca
  const mainPylonGeom = new THREE.PlaneGeometry(24, 225);
  const mainPylon = new THREE.Mesh(mainPylonGeom, navyMat);
  mainPylon.position.set(-10, 153, 0.12);
  studentCenterGroup.add(mainPylon);

  // E. Jalur Pipa Aksen Sirkuit Perak (Iconic Step-Jogged Circuit Conduits)
  // Ciri khas arsitektur Polindra: pipa conduit perak yang berjalan tegak lalu berbelok miring
  const conduitMat = new THREE.MeshBasicMaterial({ color: PALETTE.scSilver });

  // Pipa lurus atas
  const conduitTopLGeom = new THREE.PlaneGeometry(2.5, 95);
  const conduitTopL = new THREE.Mesh(conduitTopLGeom, conduitMat);
  conduitTopL.position.set(-24, 208, 0.15);
  studentCenterGroup.add(conduitTopL);

  const conduitTopRGeom = new THREE.PlaneGeometry(2.5, 95);
  const conduitTopR = new THREE.Mesh(conduitTopRGeom, conduitMat);
  conduitTopR.position.set(4, 208, 0.15);
  studentCenterGroup.add(conduitTopR);

  // Bagian sirkuit miring 45 derajat (jogged circuit trace)
  const jogL1Geom = new THREE.PlaneGeometry(2.5, 45);
  const jogL1 = new THREE.Mesh(jogL1Geom, conduitMat);
  jogL1.position.set(-27, 142, 0.15);
  jogL1.rotation.z = THREE.MathUtils.degToRad(-25);
  studentCenterGroup.add(jogL1);

  const jogL2Geom = new THREE.PlaneGeometry(2.5, 45);
  const jogL2 = new THREE.Mesh(jogL2Geom, conduitMat);
  jogL2.position.set(7, 142, 0.15);
  jogL2.rotation.z = THREE.MathUtils.degToRad(-25);
  studentCenterGroup.add(jogL2);

  // Pipa lurus bawah menyambung ke kanopi
  const conduitBotLGeom = new THREE.PlaneGeometry(2.5, 65);
  const conduitBotL = new THREE.Mesh(conduitBotLGeom, conduitMat);
  conduitBotL.position.set(-36, 92, 0.15);
  studentCenterGroup.add(conduitBotL);

  const conduitBotRGeom = new THREE.PlaneGeometry(2.5, 65);
  const conduitBotR = new THREE.Mesh(conduitBotRGeom, conduitMat);
  conduitBotR.position.set(-2, 92, 0.15);
  studentCenterGroup.add(conduitBotR);

  // F. Atap Parapet Putih & Penthouse Mesin AC (Rooftop Cornice & HVAC)
  const parapetGeom = new THREE.PlaneGeometry(180, 16);
  const parapetMesh = new THREE.Mesh(parapetGeom, rightTowerMat);
  parapetMesh.position.set(-15, 270, 0.10);
  studentCenterGroup.add(parapetMesh);

  // 4 Unit Kotak Mesin Pendingin HVAC di Atap
  for (let h = 0; h < 4; h++) {
    const hvacGeom = new THREE.PlaneGeometry(18, 12);
    const hvacMesh = new THREE.Mesh(hvacGeom, conduitMat);
    hvacMesh.position.set(-70 + h * 24, 282, 0.04);
    studentCenterGroup.add(hvacMesh);

    // Kisi kisi ventilasi HVAC
    const ventGeom = new THREE.PlaneGeometry(14, 2);
    const ventMesh = new THREE.Mesh(ventGeom, louverDarkMat);
    ventMesh.position.set(-70 + h * 24, 282, 0.06);
    studentCenterGroup.add(ventMesh);
  }


  // =========================================================================
  // 3. PART 3: LEFT DROP-OFF PORTICO & CANOPY (KANOPI MIRING & LOUVER PERAK)
  // =========================================================================
  // A. Sayap Mezzanine Lantai 2 di Belakang Kanopi
  const mezzBaseGeom = new THREE.PlaneGeometry(100, 48);
  const mezzBase = new THREE.Mesh(mezzBaseGeom, rightTowerMat);
  mezzBase.position.set(-145, 96, 0.02);
  studentCenterGroup.add(mezzBase);

  // Kaca jendela lantai 2 sayap kiri
  const mezzGlassGeom = new THREE.PlaneGeometry(94, 28);
  const mezzGlass = new THREE.Mesh(mezzGlassGeom, new THREE.MeshBasicMaterial({ color: 0x38BDF8 }));
  mezzGlass.position.set(-145, 94, 0.04);
  studentCenterGroup.add(mezzGlass);

  // Parapet atap mezzanine
  const mezzRoofGeom = new THREE.PlaneGeometry(106, 8);
  const mezzRoof = new THREE.Mesh(mezzRoofGeom, rightTowerMat);
  mezzRoof.position.set(-145, 122, 0.06);
  studentCenterGroup.add(mezzRoof);

  // B. Tiang Miring Portico Kiri (Massive Angled Drop-off Support Pylon)
  // Tiang struktural arang gelap miring di sisi kiri yang menyangga kanopi drop-off
  const canopyShape = new THREE.Shape();
  canopyShape.moveTo(-222, 10);
  canopyShape.lineTo(-195, 10);
  canopyShape.lineTo(-195, 82);
  canopyShape.lineTo(-228, 82);
  canopyShape.lineTo(-222, 10);
  canopyShape.closePath();

  const pylonGeom = new THREE.ShapeGeometry(canopyShape);
  const pylonMat = new THREE.MeshBasicMaterial({ color: 0x1E293B });
  const pylonMesh = new THREE.Mesh(new THREE.ShapeGeometry(canopyShape), pylonMat);
  pylonMesh.position.set(0, 0, 0.20);
  studentCenterGroup.add(pylonMesh);

  // Garis alur panel horisontal pada tiang miring
  for (let g = 1; g <= 4; g++) {
    const grooveGeom = new THREE.PlaneGeometry(30, 1.5);
    const groove = new THREE.Mesh(grooveGeom, new THREE.MeshBasicMaterial({ color: 0x475569 }));
    groove.position.set(-210, 10 + g * 14, 0.22);
    studentCenterGroup.add(groove);
  }

  // C. Balok Kanopi Utama Navy (Main Navy Canopy Roof Beam)
  const canopyBeamGeom = new THREE.PlaneGeometry(140, 24);
  const canopyBeam = new THREE.Mesh(canopyBeamGeom, navyMat);
  canopyBeam.position.set(-140, 72, 0.18);
  studentCenterGroup.add(canopyBeam);

  // Lis putih plafon bawah kanopi (Soffit Trim)
  const soffitGeom = new THREE.PlaneGeometry(138, 3.5);
  const soffit = new THREE.Mesh(soffitGeom, new THREE.MeshBasicMaterial({ color: 0xF1F5F9 }));
  soffit.position.set(-140, 60, 0.22);
  studentCenterGroup.add(soffit);

  // D. 4 Garis Louver Perak Berbelok Sudut 45 Derajat (Iconic Stepped Silver Stripes)
  // Fitur paling ikonik dari foto referensi: garis perak yang berbelok miring 45 derajat
  const stripeYs = [54, 47, 40, 33];
  stripeYs.forEach((baseY, idx) => {
    // 1. Segmen horisontal kiri (di bawah kanopi)
    const segLWidth = 60 - idx * 2;
    const segLGeom = new THREE.PlaneGeometry(segLWidth, 3.5);
    const segL = new THREE.Mesh(segLGeom, conduitMat);
    segL.position.set(-110 - idx, baseY - 8, 0.25);
    studentCenterGroup.add(segL);

    // 2. Segmen miring 45 derajat (diagonal step-up)
    const segDiagGeom = new THREE.PlaneGeometry(3.5, 12);
    const segDiag = new THREE.Mesh(segDiagGeom, conduitMat);
    segDiag.position.set(-78 - idx, baseY - 3, 0.25);
    segDiag.rotation.z = THREE.MathUtils.degToRad(-45);
    studentCenterGroup.add(segDiag);

    // 3. Segmen horisontal kanan (melintang di fasad kaca)
    const segRWidth = 92 - idx * 4;
    const segRGeom = new THREE.PlaneGeometry(segRWidth, 3.5);
    const segR = new THREE.Mesh(segRGeom, conduitMat);
    segR.position.set(-28 + idx * 2, baseY + 2, 0.25);
    studentCenterGroup.add(segR);
  });

  // E. Lobi Kaca Lantai Dasar & Pintu Masuk Utama (Ground Entrance Lobby)
  const lobbyWallGeom = new THREE.PlaneGeometry(92, 46);
  const lobbyWall = new THREE.Mesh(lobbyWallGeom, new THREE.MeshBasicMaterial({ color: 0x0284C7 }));
  lobbyWall.position.set(-40, 33, 0.08);
  studentCenterGroup.add(lobbyWall);

  // Pintu masuk kaca ganda berbingkai navy gelap
  const doorPortalGeom = new THREE.PlaneGeometry(42, 36);
  const doorPortal = new THREE.Mesh(doorPortalGeom, new THREE.MeshBasicMaterial({ color: 0x0F172A }));
  doorPortal.position.set(-30, 28, 0.12);
  studentCenterGroup.add(doorPortal);

  const doorGlassLGeom = new THREE.PlaneGeometry(16, 30);
  const doorGlassL = new THREE.Mesh(doorGlassLGeom, new THREE.MeshBasicMaterial({ color: 0x7DD3FC }));
  doorGlassL.position.set(-39, 27, 0.14);
  studentCenterGroup.add(doorGlassL);

  const doorGlassRGeom = new THREE.PlaneGeometry(16, 30);
  const doorGlassR = new THREE.Mesh(doorGlassRGeom, new THREE.MeshBasicMaterial({ color: 0x7DD3FC }));
  doorGlassR.position.set(-21, 27, 0.14);
  studentCenterGroup.add(doorGlassR);

  // F. Plat Tulisan & Kanopi Pintu Masuk "STUDENT CENTER"
  const signCanopyGeom = new THREE.PlaneGeometry(95, 14);
  const signCanopy = new THREE.Mesh(signCanopyGeom, navyMat);
  signCanopy.position.set(20, 52, 0.22);
  studentCenterGroup.add(signCanopy);

  // Strip lis biru cyan di bawah kanopi nama
  const signTrimGeom = new THREE.PlaneGeometry(95, 2.5);
  const signTrim = new THREE.Mesh(signTrimGeom, new THREE.MeshBasicMaterial({ color: 0x38BDF8 }));
  signTrim.position.set(20, 45, 0.24);
  studentCenterGroup.add(signTrim);

  // Plat huruf nama "STUDENT CENTER"
  const signTextGeom = new THREE.PlaneGeometry(88, 8);
  const signText = new THREE.Mesh(signTextGeom, new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
  signText.position.set(20, 52, 0.26);
  studentCenterGroup.add(signText);


  // =========================================================================
  // 4. PART 4: POLINDRA LOGO BADGE (LAMBANG RESMI POLINDRA)
  // =========================================================================
  // Bertumpu di kolom navy kaca lantai 4/5 (y = 192, x = -10)
  const logoOuterGeom = new THREE.CircleGeometry(16, 32);
  const logoOuterMat = new THREE.MeshBasicMaterial({ color: PALETTE.scYellow });
  const logoOuterMesh = new THREE.Mesh(logoOuterGeom, logoOuterMat);
  logoOuterMesh.position.set(-10, 192, 0.32);
  studentCenterGroup.add(logoOuterMesh);

  const logoMidGeom = new THREE.CircleGeometry(12.5, 32);
  const logoMidMat = new THREE.MeshBasicMaterial({ color: PALETTE.scNavy });
  const logoMidMesh = new THREE.Mesh(logoMidGeom, logoMidMat);
  logoMidMesh.position.set(-10, 192, 0.36);
  studentCenterGroup.add(logoMidMesh);

  const logoCoreGeom = new THREE.CircleGeometry(8, 24);
  const logoCoreMesh = new THREE.Mesh(logoCoreGeom, new THREE.MeshBasicMaterial({ color: cGlass }));
  logoCoreMesh.position.set(-10, 192, 0.40);
  studentCenterGroup.add(logoCoreMesh);

  const logoCrescentGeom = new THREE.CircleGeometry(4.5, 16);
  const logoCrescentMesh = new THREE.Mesh(logoCrescentGeom, new THREE.MeshBasicMaterial({ color: 0xF59E0B }));
  logoCrescentMesh.position.set(-10, 194, 0.44);
  studentCenterGroup.add(logoCrescentMesh);


  // =========================================================================
  // 5. PART 5: LANDSCAPING TANAMAN HIJAU (TROPICAL SHRUBS ALONG THE PLINTH)
  // =========================================================================
  // Semak-semak hijau di depan lobi seperti pada foto asli
  const shrubMatDark = new THREE.MeshBasicMaterial({ color: 0x059669 });
  const shrubMatLight = new THREE.MeshBasicMaterial({ color: 0x10B981 });
  const shrubPositions = [
    { x: -92, r: 8, c: shrubMatDark },
    { x: -80, r: 10, c: shrubMatLight },
    { x: -68, r: 7, c: shrubMatDark },
    { x: 38, r: 9, c: shrubMatLight },
    { x: 50, r: 11, c: shrubMatDark },
    { x: 62, r: 8, c: shrubMatLight }
  ];
  shrubPositions.forEach((sh) => {
    const shGeom = new THREE.CircleGeometry(sh.r, 16);
    const shMesh = new THREE.Mesh(shGeom, sh.c);
    shMesh.position.set(sh.x, 14, 0.28);
    shMesh.scale.set(1.1, 0.8, 1);
    studentCenterGroup.add(shMesh);
  });

  // --- PENEMPATAN PADA TINGKAT RUMPUT ---
  // Bertumpu pas di atas garis rumput (y = -135)
  studentCenterGroup.position.set(0, -135, 0);

  scene.add(studentCenterGroup);

  return {
    id: 'student-center',
    name: 'Student Center Polindra',
    icon: '🏢',
    type: 'Compound Group',
    object: studentCenterGroup
  };
}

// Deprecated old function (createMainBuilding) commented out per specification
/*
export function createMainBuilding(scene) {
  // Objek lama 'Gedung Utama' telah digantikan oleh createStudentCenter()
}
*/

/**
 * GEOMETRI 3: SEGITIGA (CircleGeometry dengan 3 Segmen)
 * Objek: Atap Limas Pedimen Utama Gedung Kampus
 * Menggunakan thetaStart = Math.PI / 2 agar puncak segitiga tegak lurus ke atas secara simetris
 */
export function createRoofTriangle(scene) {
  const roofGroup = new THREE.Group();
  roofGroup.name = "Atap Segitiga Gedung";

  // Atap Segitiga dibuat dengan CircleGeometry(radius, 3, Math.PI / 2, Math.PI * 2)
  // thetaStart = Math.PI / 2 memastikan sumbu Y adalah garis simetri vertikal
  const triangleGeom = new THREE.CircleGeometry(96, 3, Math.PI / 2, Math.PI * 2);
  const triangleMat = new THREE.MeshBasicMaterial({ color: PALETTE.roof });
  const triangleMesh = new THREE.Mesh(triangleGeom, triangleMat);

  // Terapkan Scaling: Lebar disesuaikan melebihi dinding (1.8x) dan tinggi proporsional (0.8x)
  triangleMesh.scale.set(1.8, 0.8, 1);

  roofGroup.add(triangleMesh);

  // Ornamen Lambang Geometris di Tengah Pedimen Atap
  const crestGeom = new THREE.CircleGeometry(15, 32);
  const crestMat = new THREE.MeshBasicMaterial({ color: PALETTE.customAccent });
  const crestMesh = new THREE.Mesh(crestGeom, crestMat);
  crestMesh.position.set(0, 10, 1);
  roofGroup.add(crestMesh);

  // Translasi ke puncak Gedung Utama:
  // Dinding atas gedung berada di y = 35. Bagian bawah atap (y = -0.5 * 96 * 0.8 = -38.4)
  // Jadi posisi y = 35 + 38.4 = 73.4 agar bertumpu pas di atas dinding utama.
  roofGroup.position.set(20, 74, 0);

  scene.add(roofGroup);

  return {
    id: 'roof',
    name: 'Atap Segitiga (Circle 3-seg)',
    icon: '📐',
    type: 'Circle (3 Segments)',
    object: roofGroup
  };
}

// Deprecated old function (createPolindraCustomBuilding) commented out per specification
/*
export function createPolindraCustomBuilding(scene) {
  // Objek lama 'Gedung Ikonik Menara' telah digantikan oleh createStudentCenter()
}
*/

/**
 * OBJEK POHON CEMARA (Compound Triangles)
 * Demonstrasi transformasi Translasi, Scaling berulang, dan penumpukan vertikal
 */
export function createPineTree(scene, posX, posY, baseScale, idName, labelName) {
  const treeGroup = new THREE.Group();
  treeGroup.name = labelName;

  // Batang Pohon (PlaneGeometry) - dasar batang di y = 0
  const trunkGeom = new THREE.PlaneGeometry(16, 42);
  const trunkMat = new THREE.MeshBasicMaterial({ color: PALETTE.treeTrunk });
  const trunkMesh = new THREE.Mesh(trunkGeom, trunkMat);
  trunkMesh.position.set(0, 21, 0);
  treeGroup.add(trunkMesh);

  // 3 Tingkat Daun Segitiga menggunakan CircleGeometry(radius, 3, Math.PI / 2)
  // thetaStart = Math.PI / 2 membuat segitiga tegak lurus sempurna
  const levels = [
    { r: 48, y: 55, scaleX: 1.1, scaleY: 0.85, color: PALETTE.treeDark },
    { r: 38, y: 85, scaleX: 1.05, scaleY: 0.85, color: PALETTE.treeLight },
    { r: 28, y: 112, scaleX: 1.0, scaleY: 0.85, color: PALETTE.treeDark }
  ];

  levels.forEach(lvl => {
    const triGeom = new THREE.CircleGeometry(lvl.r, 3, Math.PI / 2, Math.PI * 2);
    const triMat = new THREE.MeshBasicMaterial({ color: lvl.color });
    const triMesh = new THREE.Mesh(triGeom, triMat);
    
    triMesh.position.set(0, lvl.y, 1);
    triMesh.scale.set(lvl.scaleX, lvl.scaleY, 1);
    treeGroup.add(triMesh);
  });

  // Transformasi Translasi & Scaling
  treeGroup.position.set(posX, posY, 0);
  treeGroup.scale.set(baseScale, baseScale, 1);

  scene.add(treeGroup);

  return {
    id: idName,
    name: labelName,
    icon: '🌲',
    type: 'Compound Geometry',
    object: treeGroup
  };
}

/**
 * OBJEK TIANG BENDERA & BENDERA MERAH PUTIH (PlaneGeometry)
 */
export function createFlagPole(scene, posX = -270, posY = -146) {
  const flagGroup = new THREE.Group();
  flagGroup.name = "Tiang Bendera Kampus";

  // Tiang (Persegi Panjang Ramping)
  const poleGeom = new THREE.PlaneGeometry(4, 150);
  const poleMat = new THREE.MeshBasicMaterial({ color: PALETTE.flagPole });
  const poleMesh = new THREE.Mesh(poleGeom, poleMat);
  poleMesh.position.set(0, 75, 0); // Dari dasar y=0 hingga y=150
  flagGroup.add(poleMesh);

  // Bulatan Emas Puncak Tiang (CircleGeometry)
  const finialGeom = new THREE.CircleGeometry(5, 16);
  const finialMat = new THREE.MeshBasicMaterial({ color: PALETTE.customAccent });
  const finialMesh = new THREE.Mesh(finialGeom, finialMat);
  finialMesh.position.set(0, 153, 1);
  flagGroup.add(finialMesh);

  // Bendera Merah (PlaneGeometry)
  const redGeom = new THREE.PlaneGeometry(40, 14);
  const redMat = new THREE.MeshBasicMaterial({ color: PALETTE.flagRed });
  const redMesh = new THREE.Mesh(redGeom, redMat);
  redMesh.position.set(20, 141, 1);
  flagGroup.add(redMesh);

  // Bendera Putih (PlaneGeometry)
  const whiteGeom = new THREE.PlaneGeometry(40, 14);
  const whiteMat = new THREE.MeshBasicMaterial({ color: PALETTE.flagWhite });
  const whiteMesh = new THREE.Mesh(whiteGeom, whiteMat);
  whiteMesh.position.set(20, 127, 1);
  flagGroup.add(whiteMesh);

  // Posisi di halaman plaza depan kampus, terbuka dan tidak bertabrakan dengan kanopi
  flagGroup.position.set(posX, posY, 0);
  flagGroup.scale.set(1.0, 1.0, 1);

  scene.add(flagGroup);

  return {
    id: 'flag-pole',
    name: 'Tiang Bendera (PlaneGeometry)',
    icon: '🚩',
    type: 'PlaneGeometry',
    object: flagGroup
  };
}

/**
 * OBJEK DASAR: LAPANGAN & PLAZA KAMPUS (PlaneGeometry)
 */
export function createGroundEnvironment(scene) {
  const envGroup = new THREE.Group();
  envGroup.name = "Lapangan & Plaza Kampus";

  // Jalur Trotoar / Plaza Luas
  const plazaGeom = new THREE.PlaneGeometry(1200, 180);
  const plazaMat = new THREE.MeshBasicMaterial({ color: PALETTE.groundPlaza });
  const plazaMesh = new THREE.Mesh(plazaGeom, plazaMat);
  plazaMesh.position.set(0, -235, -5);
  envGroup.add(plazaMesh);

  // Jalur Rumput Hijau Lapangan
  const lawnGeom = new THREE.PlaneGeometry(1200, 22);
  const lawnMat = new THREE.MeshBasicMaterial({ color: PALETTE.groundLawn });
  const lawnMesh = new THREE.Mesh(lawnGeom, lawnMat);
  lawnMesh.position.set(0, -146, -4);
  envGroup.add(lawnMesh);

  scene.add(envGroup);

  return {
    id: 'ground-env',
    name: 'Plaza & Lapangan (PlaneGeometry)',
    icon: '🌱',
    type: 'PlaneGeometry',
    object: envGroup
  };
}

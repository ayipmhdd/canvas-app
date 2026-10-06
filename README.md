# Tugas Grafika Komputer - Polindra 2D Interactive Scene

![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js)
![JavaScript](https://img.shields.io/badge/ES6_Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Theme](https://img.shields.io/badge/Theme-Dark_Mode_Default-121212?style=for-the-badge)
![Institution](https://img.shields.io/badge/Kampus-POLINDRA-0284c7?style=for-the-badge)

Aplikasi WebGL 2D grafika komputer interaktif berbasis **Three.js** dan arsitektur modular **ES6 Vanilla JavaScript**. Aplikasi ini memvisualisasikan komposisi geometris lanskap kampus **Politeknik Negeri Indramayu (Polindra)**—termasuk fasad ikonik **Gedung Student Center Polindra**—dalam antarmuka modern bergaya **Dark Mode Design Workspace** (terinspirasi dari workflow Figma dan Canva).

---

## 📸 Antarmuka Aplikasi

Aplikasi mengusung tema **Dark Mode** modern dengan latar belakang kanvas *dotted grid* kontras tinggi (`#121212`), panel *glassmorphism* tembus pandang (`rgba(30, 33, 40, 0.9)`), serta tata letak workspace yang rapi dan responsif.

---

## ✨ Fitur Utama (Key Features)

### 1. 🎨 Figma-Style Dark Workspace UI
* **Canvas Dotted Grid:** Latar belakang kanvas abu gelap dengan pola bintik grid radial (`#333333`) khas aplikasi desain vektor modern.
* **Glassmorphism Panels:** Panel melayang transparan berbayang halus yang terdiri dari:
  * **Top Bar:** Menampilkan identitas proyek, status engine WebGL, badge mode kamera ortografik, dan indikator koordinat kursor mouse real-time.
  * **Left Sidebar:** Panel identitas mahasiswa dan pengelola layer objek (*Layer Manager*).
  * **Right Toolbar:** Alat navigasi cepat (Select, Pan/Hand, Shape, Color Picker, Zoom In/Out, Play/Pause Animasi, Reset View, Toggle Grid, dan Export PNG).
  * **Bottom Bar:** *Transform Inspector* yang menampilkan target objek aktif beserta slider dan kontrol input numerik.
* **Dynamic Theme Switcher (Dark & Light Mode):** Tombol toggle interaktif (ikon Sun/Moon) di Top Bar untuk beralih antara tema Dark Mode dan Light Mode secara halus tanpa reload, dilengkapi penyimpanan preferensi otomatis via `localStorage` dan deteksi sistem operasi (`prefers-color-scheme`).
* **Collapsible Panels:** Panel atas dan kiri dapat dilipat (*collapse/expand*) untuk memberikan ruang kerja kanvas penuh.

### 2. 🏛️ Custom Polindra Student Center & Campus Scene
* **Gedung Student Center Polindra:** Fasad arsitektur dibangun menggunakan kombinasi poligon kustom (`THREE.ShapeGeometry`), kanopi bertingkat, pilar menara kuning khas Polindra, serta panel kaca reflektif (`THREE.PlaneGeometry`).
* **Komposisi Lingkungan Kampus:**
  * Matahari terbit dengan aksen sinar rotasi melingkar (`THREE.CircleGeometry`).
  * Trotoar plaza dan hamparan rumput lapangan kampus (`THREE.PlaneGeometry`).
  * Tiang bendera Merah Putih dengan animasi berkibar.
  * Deretan pohon cemara geometris bertekstur hijau lapis tiga.
  * Awan minimalis mengambang dengan simulasi pergerakan dinamis.

### 3. 🎯 Manipulasi Kanvas Langsung via Three.js Raycaster
* **Direct Object Selection:** Klik langsung pada objek geometri mana pun di atas kanvas WebGL untuk memilihnya.
* **Direct Drag & Drop:** Objek yang dipilih dapat digeser (*translasi*) langsung di atas kanvas dengan menyeret mouse.

### 4. 🔄 Custom 2D Transform Gizmo & Bounding Box
* **Bounding Box Interaktif:** Kotak penanda dinamis yang otomatis mengikuti posisi, orientasi, dan skala objek terpilih.
* **Rotation Handle:** Pin bulat di atas objek yang dapat diputar secara melingkar untuk mengubah rotasi sumbu Z (`rotation.z`).
* **Scale Corner Handles:** 4 handle sudut untuk melakukan penskalaan ukuran proporsional secara interaktif (`scale.x`, `scale.y`).
* **Inspector Slider:** Nilai posisi (X, Y), rotasi (°), dan skala juga dapat disesuaikan melalui slider maupun input angka presisi di panel bawah.

### 5. 📑 Manajemen Layer & Z-Index Sorting
* **Layer Hierarchy:** Setiap objek terdaftar pada panel samping kiri lengkap dengan badge tipe geometri (`Circle`, `Plane`, `Shape`, `Group`).
* **Reorder Layer:** Tombol *Bring Forward* (▲) dan *Send Backward* (▼) untuk mengatur urutan tumpukan render objek secara dinamis pada sumbu Z.
* **Toggle Visibility:** Sembunyikan atau tampilkan objek tertentu dengan tombol visibilitas mata (👁️).

### 6. 🎨 Popover Color Picker & Quick Shape Generator
* **Interactive Color Picker:** Ubah warna material objek aktif secara instan menggunakan color picker native, slider hue visual, input kode HEX, atau palet warna preset kampus Polindra.
* **Shape Generator:** Tambahkan objek geometri 2D baru ke dalam kanvas (Lingkaran, Persegi, Segitiga, dan Custom Shape) secara dinamis.

### 7. 🎬 Animasi & Ekspor Kanvas
* **Simulasi Pergerakan:** Orbit matahari dan translasi awan dapat dijalankan atau dihentikan sementara (*play/pause*) melalui tombol toolbar.
* **Ekspor Gambar PNG:** Unduh hasil karya kanvas ke file gambar PNG resolusi tinggi secara instan.

---

## 🛠️ Tech Stack & Persyaratan Grafika

* **Engine Grafika:** [Three.js](https://threejs.org/) (r128) via CDN ESM.
* **Kamera:** `THREE.OrthographicCamera` (proyeksi 2D tanpa distorsi perspektif kedalaman).
* **Material:** `THREE.MeshBasicMaterial` untuk mempertahankan gaya warna flat 2D yang bersih dan kontras.
* **Bahasa & Arsitektur:** Vanilla JavaScript (ES6 Modules) murni tanpa framework JS berat atau bundler eksternal (Vite/Webpack).
* **Styling:** CSS3 murni dengan variabel `:root`, Flexbox, Grid, dan efek kaca backdrop-filter modern.

---

## 📂 Struktur Direktori Proyek

```text
canvas-app/
├── css/
│   └── styles.css                   # Sistem desain Dark Mode, komponen & layout workspace
├── js/
│   ├── components/                  # Komponen UI modular
│   │   ├── BottomBar.js             # Panel inspektor transformasi geometri
│   │   ├── ColorPickerMenu.js       # Menu popover pengubah warna material
│   │   ├── LeftSidebar.js           # Sidebar identitas mahasiswa & daftar layer
│   │   ├── RightToolbar.js          # Toolbar alat mengambang sisi kanan
│   │   ├── ShapeMenu.js             # Menu popover penambah bentuk geometri
│   │   ├── Toast.js                 # Komponen notifikasi toast
│   │   └── TopBar.js                # Top bar informasi & koordinat kursor
│   ├── config/
│   │   └── Palette.js               # Palet warna identitas Polindra & konstanta frustum
│   ├── core/                        # Engine inti grafika komputer
│   │   ├── ThreeScene.js            # Core Three.js: Scene, OrthographicCamera, Renderer, Raycaster
│   │   └── TransformGizmo2D.js      # Gizmo manipulasi 2D (Bounding Box, Rotasi, Skala)
│   ├── objects/
│   │   └── CampusGeometries.js      # Pembuat geometri Student Center, Matahari, Pohon, dll.
│   ├── ui/
│   │   ├── DOMInjector.js           # Injektor elemen template HTML
│   │   └── UIController.js          # Pengontrol event UI & sinkronisasi dengan ThreeScene
│   └── main.js                      # Entry point bootstrap aplikasi & render loop
├── .gitignore                       # Mengabaikan file sistem, node_modules, dan spesifikasi lokal
├── index.html                       # Berkas HTML utama aplikasi
└── README.md                        # Dokumentasi resmi proyek
```

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

Karena proyek ini menggunakan **JavaScript ES6 Modules** (`<script type="module">`), browser memblokir impor file modul jika dibuka langsung dengan protokol `file:///` (kebijakan keamanan CORS browser). Oleh karena itu, aplikasi harus dijalankan melalui **Local Web Server**.

Pilih salah satu cara termudah berikut:

### Opsi 1: Menggunakan Node.js / `npx serve` (Direkomendasikan)
Jika di komputer Anda sudah terpasang Node.js, buka terminal di folder proyek ini dan jalankan:
```bash
npx serve .
```
Setelah server berjalan, buka URL yang tampil di terminal (contoh: `http://localhost:3000`).

---

### Opsi 2: Menggunakan Ekstensi "Live Server" (VS Code)
1. Buka folder `canvas-app` di **Visual Studio Code**.
2. Pasang ekstensi **Live Server** (oleh *Ritwick Dey*) jika belum terpasang.
3. Buka file `index.html`.
4. Klik kanan di area kode lalu pilih **"Open with Live Server"** (atau klik tombol **Go Live** di pojok kanan bawah jendela VS Code).
5. Halaman web akan otomatis terbuka di browser Anda.

---

### Opsi 3: Menggunakan Python
Jika di komputer Anda terpasang Python, jalankan perintah berikut di terminal:
```bash
python -m http.server 5500
```
Buka browser Anda dan akses:
👉 **[http://localhost:5500](http://localhost:5500)**

---

## 👨‍💻 Identitas Mahasiswa

* **Nama:** Ayip Muhammad
* **NIM:** 2305059
* **Program Studi / Kampus:** Politeknik Negeri Indramayu (POLINDRA)
* **Mata Kuliah:** Grafika Komputer
* **Tahun Akademik:** 2026 / Genap

---

## 📄 Lisensi & Hak Cipta
Dibuat untuk keperluan akademik pemenuhan Tugas Praktikum Mata Kuliah Grafika Komputer, Program Studi Teknik Informatika, Politeknik Negeri Indramayu.

# Spesifikasi Proyek: Aplikasi Grafika Komputer 2D - Polindra (Light Mode Workspace)

## 1. Deskripsi Proyek
Proyek ini adalah sebuah aplikasi web grafika komputer berbasis HTML dan Three.js. Tujuan utamanya adalah memenuhi tugas pembuatan objek 2D (lingkaran, persegi, segitiga, dan bentuk custom gedung kampus) yang disusun menjadi sebuah komposisi pemandangan kampus Polindra yang minimalis. Aplikasi harus dibalut dalam antarmuka pengguna (UI) bertema "Light Mode Design Workspace" yang terinspirasi dari layout editor desain modern.

## 2. Tech Stack & Persyaratan Berkas
*   **Format:** Harus dalam SATU file `.html` (Single File Application).
*   **Styling:** CSS murni di dalam tag `<style>`, menggunakan layout Flexbox/Grid dan posisi absolut.
*   **Logic & 3D Engine:** JavaScript murni (Vanilla JS) dan Three.js (diimpor via CDN, contoh: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`).

## 3. Spesifikasi UI/UX (Tema: Light Workspace dengan Dotted Background)
Aplikasi memiliki layout overlay di atas kanvas Three.js dengan elemen berikut:

*   **Background / Canvas Area:**
    *   Warna dasar terang (misal: `#f8f9fa`).
    *   Pola titik-titik (dotted grid) bergaya kanvas desain menggunakan CSS `radial-gradient` (titik warna abu-abu `#ced4da`, ukuran grid sekitar `20px`).
    *   Kanvas Three.js harus memiliki `alpha: true` agar background titik-titik CSS terlihat menembusnya.
*   **Top Bar:**
    *   Minimalis, transparan atau berwarna putih semi-transparan.
    *   Berisi judul teks di sebelah kiri: "Tugas Grafika Komputer - Scene Polindra".
*   **Left Sidebar (Panel Layer/Info):**
    *   Panel bergaya *floating* di sebelah kiri dengan sudut membulat (rounded corners) dan bayangan halus (soft drop shadow).
    *   Warna background putih (`#ffffff`).
    *   Berisi daftar informasi: Nama, NIM, dan "Daftar Objek" (Matahari, Atap, Gedung Utama, dll).
*   **Right Toolbar:**
    *   Kumpulan ikon/tombol alat berbentuk vertikal melayang di sisi kanan (merepresentasikan alat desain seperti pan, zoom, export). Cukup UI statis/dummy berbentuk tombol bulat kecil bersusun vertikal.
*   **Bottom Floating Bar:**
    *   Panel kecil melayang di tengah-bawah (menggantikan *prompt bar* pada referensi).
    *   Berisi keterangan teks transformasi yang aktif: "Transformasi diterapkan: Translasi (x,y), Rotasi (sumbu z), Scaling".

## 4. Spesifikasi Logika Three.js & Grafika
*   **Kamera:** WAJIB menggunakan `THREE.OrthographicCamera` untuk memastikan objek tidak memiliki distorsi perspektif (karena ini adalah tugas objek 2D).
*   **Material:** Gunakan `THREE.MeshBasicMaterial` untuk setiap objek agar warnanya solid (flat 2D look) dan berikan properti `color` yang berbeda untuk setiap objek.
*   **Objek Geometri yang Dibutuhkan & Komposisinya:**
    1.  **Matahari (Lingkaran):** Menggunakan `THREE.CircleGeometry`. Ditempatkan di bagian atas.
    2.  **Badan Gedung Utama (Persegi/Persegi Panjang):** Menggunakan `THREE.PlaneGeometry`.
    3.  **Atap (Segitiga):** Menggunakan `THREE.CircleGeometry(radius, 3)` atau kustom titik membentuk segitiga.
    4.  **Gedung Polindra (Custom Shape):** Menggunakan `THREE.ShapeGeometry`. Buatlah bentuk poligon sederhana yang menyerupai pilar atau bentuk bangunan ikonik/asimetris, lalu ekstrusi menjadi objek 2D rata.
*   **Penerapan Transformasi Geometri (Minimal 2, terapkan pada objek-objek di atas):**
    *   **Translasi:** Wajib digunakan pada semua objek via `.position.x` dan `.position.y` untuk merangkai objek-objek tersebut menjadi satu gambar padu (Pemandangan Gedung Kampus).
    *   **Rotasi:** Terapkan pada objek tertentu (misal: aksen di sekitar matahari atau hiasan atap) menggunakan `.rotation.z`.
    *   **Scaling:** Terapkan pada objek tertentu untuk menyesuaikan proporsi ukuran menggunakan `.scale.set(x, y, 1)`.

## 5. Instruksi Khusus untuk AI Agent (Antigravity)
1.  Buat struktur HTML5 standar.
2.  Tambahkan CSS untuk layout *Workspace* sesuai spesifikasi di atas (terutama background *dotted* dan panel melayang).
3.  Inisialisasi `THREE.Scene`, `THREE.OrthographicCamera` (sesuaikan frustum dengan `window.innerWidth` dan `innerHeight`), dan `THREE.WebGLRenderer`.
4.  Buat fungsi-fungsi terpisah untuk membangun setiap objek (Matahari, Atap, Bangunan Dasar, Bentuk Custom Polindra) agar kode mudah dibaca.
5.  Terapkan warna kontras yang harmonis (misal: kuning untuk matahari, biru/kuning khas Polindra untuk bangunan, abu-abu untuk atap).
6.  Gabungkan semua objek ke dalam `Scene` dan atur posisi (*translasi*), ukuran (*scaling*), dan putaran (*rotasi*) sehingga di tengah layar terbentuk ilustrasi sederhana bangunan.
7.  Tangani fungsi `window.addEventListener('resize', ...)` agar ukuran kanvas dan frustum kamera ortografik beradaptasi dengan baik.
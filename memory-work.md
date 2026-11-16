# memory-work.md - Rekod Perbincangan & Pelan Kerja

> Dokumen ini menyimpan perbincangan, idea, dan seni bina yang dipersetujui sebelum arahan execute dijalankan.

## 🗓️ Sesi Perbincangan: 2026-11-16 15:42:00 (Kemaskini v2)

### 💬 Keperluan / Input Terkini Pengguna:
1. **Stack**: GitHub Pages sepenuhnya (serverless statik + GitHub Actions CI/CD).
2. **Avatar Pemain**:
   - Model 3D *Low-Poly* ringkas.
   - Nama pemain terapung di atas kepala (*Name Tag*).
   - 2 variasi jantina/pakaian:
     * **Lelaki**: Berihram (kain ihram putih 2 helai).
     * **Wanita**: Pakaian ihram wanita lengkap menutup aurat (jubah dan tudung putih).
3. **Public World & Sistem Kumpulan (Groups)**:
   - Semua pemain berada dalam satu dunia terbuka awam yang sama (*Single Shared Public Space*).
   - Ada sistem kumpulan (*Group / Rombongan Jemaah*) membolehkan 2 atau lebih kumpulan bergerak serentak dalam simulasi terbuka, dengan penanda visual (warna/badge kumpulan) dan senarai ahli kumpulan.

---

### 1. 💡 Penilaian Seni Bina & Cadangan Penyelesaian (Kemaskini)

```
┌────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND & HOSTING (100% Free)                      │
│   • GitHub Pages (Static Hosting) + GitHub Actions (CI/CD Automatik)   │
│   • Stack: Vite + TypeScript + Three.js                                │
│   • UI Layer: Responsive HTML5/Tailwind/CSS HUD (Desktop & Mobile)     │
│   • Name Tags & Badges: CSS2DRenderer / Canvas Sprite Billboard        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       WebSockets & │ REST API
                       (Auto-Sync)  │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             BACKEND & MULTIPLAYER (Serverless BaaS - Supabase)         │
│   • Supabase Realtime Channel (`public-mataf-world`)                   │
│     - Penstriman broadcast koordinat (x, y, z, rot) 10-15Hz            │
│     - Presence payload: { name, gender, groupId, role, currentLap }    │
│   • Sistem Kumpulan (Group Clustering):                                │
│     - Semua pemain nampak satu sama lain di Mataf & Mas'a              │
│     - Pemain boleh cipta / sertai Kod Kumpulan (cth: #GRP-1, #MUTAWWIF)│
│     - Penanda visual warna khas (badge/ring/tag) membezakan rombongan  │
│   • Supabase Database + LocalStorage:                                  │
│     - Simpan rekod kemajuan tawaf/sa'i & tetapan profil                │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. Reka Bentuk Avatar & Name Tag:
* **Avatar Modular Low-Poly**:
  - Model asas geometri low-poly ultra-ringan (<100KB setiap satu).
  - Variasi Lelaki: Dua helai kain putih (*Izar* & *Rida'*).
  - Variasi Wanita: Pakaian longgar serba putih + tudung/hijab labuh sopan.
  - Animasi ringkas: *Idle* (berdiri diam) dan *Walk/Run* (kaki & badan berayun).
* **Floating Overhead Tag (CSS2DRenderer / Billboard Sprite)**:
  - Baris 1: Nama Pemain (cth: "Ahmad" / "Fatimah").
  - Baris 2: Tag Kumpulan dengan warna tema (cth: "[Kumpulan Safwa 🟢]" atau "[Solo ⚪]").
  - Penunjuk Ikon Ketua/Mutawwif (cth: 🚩 Ikon bendera kecil untuk ketua kumpulan).

#### B. Logik Public World + Kumpulan (In-World Grouping):
* **Satu Bilik Awam**: Semua pemain berkongsi ruang simulasi Masjidil Haram yang sama. Ini mengekalkan suasana meriah dan realistik seperti di Tanah Suci.
* **Sistem Kumpulan Ringkas (Group Overlay)**:
  - Pemain boleh memilih "Masuk Solo" atau "Sertai Kumpulan" (masukkan kod pendek cth: `UMRAH-123` atau cipta kumpulan baharu).
  - **Pengecaman Visual**: Ahli kumpulan yang sama mendapat warna tag dan *halo/ring* tanah yang sepadan.
  - **Fungsi 'Follow Mutawwif' / Compass HUD**: Jemaah dalam kumpulan boleh melihat arah kompas atau jarak ke ketua kumpulan jika terpisah dalam lautan jemaah.

---

### 2. 📋 Pelan Tindakan Bertahap (Action Plan) - Status Pelaksanaan

- [x] **Fasa 1: Asas Projek & Automasi CI/CD (GitHub)**
  - [x] Inisialisasi projek Vite + TypeScript + Three.js.
  - [x] Konfigurasi skrip binaan dan `.github/workflows/deploy.yml` untuk GitHub Pages.
  - [x] Pengesahan integrasi asas Supabase client (Environment variables selamat + mod simulasi pintar).

- [x] **Fasa 2: Persekitaran 3D & Sistem Avatar Rendah Poligon**
  - [x] Bina persekitaran 3D low-poly Masjidil Haram (Kaabah dengan Kiswah & kaligrafi emas, Dataran Mataf, Hijr Ismail, Maqam Ibrahim, Stesen Zamzam, Mas'a Safa-Marwah, zon lampu hijau).
  - [x] Cipta aset avatar Low-Poly: Model Lelaki berihram (2 helai kain putih) dan Wanita berpakaian ihram lengkap menutup aurat (jubah dan tudung labuh).
  - [x] Sistem Name Tag & Group Badge di atas kepala menggunakan Canvas Sprite Billboard resolusi tinggi bersama penunjuk Mutawwif 🚩 dan gelung warna tanah (*ground halo ring*).
  - [x] Kawalan pergerakan pemain (WASD/Keyboard untuk Desktop, Virtual Joystick untuk Mobile, kawalan orbit kamera).

- [x] **Fasa 3: Seni Bina Multiplayer Public World & Sistem Kumpulan**
  - [x] Konfigurasi Supabase Realtime channel tunggal (`public-mataf-world`).
  - [x] Penyiaran data kedudukan (x, y, z, rotation) dan status animasi pada 11-12Hz dengan *interpolation (lerp)*.
  - [x] Modul Kumpulan (Group Manager): Cipta/Sertai kod kumpulan, tetapkan peranan (Mutawwif / Jemaah), dan warna kumpulan.
  - [x] Paparan senarai ahli kumpulan dan kompas berarah dinamik menghala ke ketua (Mutawwif Compass HUD).
  - [x] Simulasi jemaah maya pintar (pelbagai kumpulan & solo) agar dunia sentiasa meriah walaupun di luar talian.

- [x] **Fasa 4: Alur Simulasi Ibadah Umrah & Sistem Simpan (Save State)**
  - [x] Logik laluan Umrah: Niat/Miqat ➔ Tawaf (7 Pusingan) ➔ Solat Sunat & Zamzam ➔ Sa'i (7 Pusingan Safa-Marwah) ➔ Tahallul ➔ Sijil Digital.
  - [x] Pengesan zon garisan (Hajarul Aswad, Rukun Yamani, Safa, Marwah, Zon Lampu Hijau) dengan pengesahan sudut anti-patah balik.
  - [x] Sistem simpanan progress: LocalStorage automatik dan penyelarasan keadaan pelbagai sesi.

- [x] **Fasa 5: UI/HUD Interaktif, Audio & Pengoptimuman Prestasi**
  - [x] Dialog pemilihan awal: Masukkan Nama, Pilih Jantina Avatar, dan Pilih/Cipta Kumpulan.
  - [x] HUD Semasa Ibadah: Paparan pusingan 7 titik, panduan doa/zikir lengkap (Arab, Rumi, Terjemahan Melayu), dan status kumpulan.
  - [x] Enjin Audio Web Audio API & TTS (Takbir Istilam, Talbiyah, Ambience Masjidil Haram, Fanfare).
  - [x] Pengoptimuman saiz bundle (< 850KB uncompressed / ~212KB gzip, jauh di bawah had 5MB) dan kadar bingkai stabil 60 FPS.

---

### 3. ⚠️ Pertimbangan / Risiko Teknikal

1. **Beban Render Pelbagai Watak (Draw Calls di Mobile):**
   * Sekiranya terdapat ramai pemain serentak di kawasan Mataf, melukis terlalu banyak mesh individu boleh menurunkan FPS peranti mudah alih.
   * *Mitigasi:* Gunakan bahan ringkas (*MeshLambertMaterial* / *MeshBasicMaterial*) dan hadkan jarak penglihatan (*culling*) untuk pemain yang berada jauh.
2. **Kesesakan Data Realtime (Supabase Rate Limit):**
   * Menghantar mesej broadcast untuk setiap pergerakan boleh menghabiskan kuota jika kadar penghantaran terlalu tinggi.
   * *Mitigasi:* Hadkan broadcast kepada 10–12 paket sesaat setiap pemain, dan hanya hantar jika kedudukan pemain berubah melebihi nilai ambang (*threshold*).
3. **Penyelarasan Pusingan Tawaf Kumpulan (Group Sync vs Individual):**
   * Setiap pemain mungkin berjalan pada kelajuan berbeza.
   * *Syor Reka Bentuk:* Kiraan pusingan kekal pada akaun individu masing-masing, namun HUD memaparkan pusingan terkini Mutawwif sebagai rujukan jemaah.

---

### 4. ❓ Soalan Penjelasan (Sebelum Pelaksanaan)

1. **Peranan Mutawwif (Ketua Kumpulan):**
   * Adakah pencipta kumpulan secara automatik menjadi "Mutawwif" (dengan ikon bendera 🚩 di atas kepala), atau sesiapa sahaja boleh jadi ketua?
2. **Audio Panduan Doa:**
   * Untuk fasa MVP pertama, adakah memadai teks doa bertulis pada skrin, atau anda mahu sokongan klip audio MP3 doa/talbiyah disertakan sekali?
## 🗓️ Sesi Perbincangan: 2026-11-16 15:43:02

### 💬 Keperluan / Idea Pengguna:
1. Stack GitHub pages
2. Avatar pemain low poly ada nama di atas kepala, ada lelaki berihram dan wanita penuh ihram wanita.
3. Semua dalam public world tetapi ada fungsi group jadi mungkin ada 2 atau lebih group dalam simulasi terbuka. 

Kemaskini

### 📐 Analisis & Pelan Kerja AI:
Terima kasih atas pengesahan dan perincian spesifikasi tersebut. Saya telah mengemas kini dokumen perancangan arkitek di [memory-work.md](file:///home/maui/github/umrah/memory-work.md).

Berikut adalah ringkasan seni bina yang diperhalusi mengikut keperluan terkini anda:

---

### 1. 💡 Penilaian Seni Bina & Cadangan Penyelesaian

#### A. Reka Bentuk Avatar & Tag Terapung (*Floating Overhead Tag*):
* **Avatar Rendah Poligon (*Low-Poly*):**
  * **Lelaki:** Model berihram 2 helai kain putih (*Izar* & *Rida'*), gaya ringkas dan bersih.
  * **Wanita:** Pakaian ihram wanita lengkap menutup aurat (jubah longgar serba putih dan tudung/hijab labuh).
  * Sistem animasi asas yang ringan: *Idle* (berdiri diam) dan *Walk* (berjalan).
* **Tag Nama & Kumpulan (CSS2DRenderer / Billboard Sprite):**
  * Terletak tepat di atas kepala setiap watak:
    * **Baris 1:** Nama Pemain (cth: *"Ahmad"* / *"Siti"*).
    * **Baris 2:** Lencana Kumpulan dengan warna tema (cth: *"[🟡 Kumpulan Safwa]"* atau *"[⚪ Solo]"*).
    * **Penanda Khas:** Ikon bendera kecil (🚩) untuk ketua rombongan / Mutawwif.

#### B. Public World dengan Lapisan Kumpulan (*In-World Grouping*):
* **Satu Alam Awam (*Single Shared Canvas*):**
  * Semua pengguna berada dalam satu dunia terbuka yang sama di Dataran Mataf & Mas'a (meriah seperti suasana sebenar).
* **Pengasingan Kumpulan Tanpa Memisahkan Ruang:**
  * Pengguna boleh memilih untuk masuk secara **Solo** atau **Sertai/Cipta Kumpulan** (menggunakan kod pendek ringkas seperti `SAFWA-1`).
  * Setiap kumpulan diberi warna tema unik (lingkaran warna di bawah kaki watak atau warna tag nama) bagi memudahkan jemaah mengecam rakan sekumpulan dalam lautan jemaah lain.
  * **HUD Kumpulan:** Menunjukkan bilangan ahli kumpulan semasa dan jarak/kompas menghala ke ketua kumpulan.

---

### 2. 📋 Pelan Tindakan Bertahap (Action Plan) - Selesai Sepenuhnya

- [x] **Fasa 1: Asas Projek & Automasi CI/CD (GitHub)**
  - [x] Inisialisasi projek Vite + TypeScript + Three.js.
  - [x] Konfigurasi skrip binaan dan alur kerja `.github/workflows/deploy.yml` ke GitHub Pages.
  - [x] Integrasi asas Supabase client (Environment variables yang selamat + sokongan mod jemaah pintar).

- [x] **Fasa 2: Persekitaran 3D & Sistem Avatar Rendah Poligon**
  - [x] Bina persekitaran 3D low-poly Masjidil Haram (Kaabah, Dataran Mataf, Safa & Marwah, Hijr Ismail, Maqam Ibrahim).
  - [x] Hasilkan aset avatar Low-Poly: Model Lelaki berihram dan Wanita berihram lengkap menutup aurat.
  - [x] Sistem Name Tag & Group Badge di atas kepala (Sprite Billboard) + ground ring warna kumpulan.
  - [x] Kawalan pergerakan pemain (WASD/Keyboard untuk Desktop, Virtual Joystick untuk Mobile).

- [x] **Fasa 3: Seni Bina Multiplayer Public World & Sistem Kumpulan**
  - [x] Sambungan Supabase Realtime channel awam (`public-mataf-world`).
  - [x] Penyiaran broadcast kedudukan pemain (x, y, z, rotation) pada kadar 11–12Hz dengan *linear interpolation (lerp)*.
  - [x] Modul Kumpulan: Cipta/Sertai kumpulan, penetapan warna rombongan, dan peranan (Ketua / Jemaah).
  - [x] Paparan senarai ahli kumpulan dan kompas berarah menghala ke ketua pada HUD tepi skrin.

- [x] **Fasa 4: Alur Simulasi Ibadah Umrah & Sistem Simpan (Save State)**
  - [x] Logik laluan Umrah: Niat/Miqat ➔ Tawaf (7 Pusingan) ➔ Solat Sunat & Zamzam ➔ Sa'i (7 Pusingan) ➔ Tahallul ➔ Sijil Tamat.
  - [x] Pengesan zon garisan (Hajarul Aswad, Rukun Yamani, Safa, Marwah, Zon Lampu Hijau) untuk kiraan pusingan automatik.
  - [x] Sistem simpanan progress: `localStorage` (luar talian) dan status berterusan.

- [x] **Fasa 5: UI/HUD Interaktif, Audio & Pengoptimuman Prestasi**
  - [x] Skrin pemilihan awal: Input Nama, Pilihan Avatar (Lelaki/Wanita), dan Kod Kumpulan.
  - [x] Paparan HUD ibadah: Kaunter pusingan, panduan doa/zikir semasa (Arab, Rumi, Terjemahan Melayu), dan status kumpulan.
  - [x] Pengoptimuman prestasi mudah alih (< 1MB saiz bundle, stabil 60 FPS, tiada aset berat luar).

---

### 3. ⚠️ Pertimbangan / Risiko Teknikal

1. **Prestasi Rendering Ramai Watak di Mobile (*Draw Calls*):**
   * Sekiranya puluhan avatar berada serentak di kawasan Mataf, melukis mesh berulang boleh menjejaskan kadar bingkai (FPS) di telefon pintar.
   * *Penyelesaian:* Menggunakan geometri *low-poly* berkongsi (*instanced mesh* atau bahan *unlit/basic*) dan mengaktifkan *distance culling* (avatar pemain yang terlalu jauh diringkaskan atau tidak dirender sepenuhnya).
2. **Kawalan Kuota Penstriman Realtime:**
   * Menghantar pergerakan secara berterusan ke pelayan Realtime boleh memakan kuota percuma Supabase jika tidak dihadkan.
   * *Penyelesaian:* Kadar hantaran dihadkan pada 10–12Hz, dan hanya dihantar apabila pemain bergerak melebihi nilai ambang (*distance threshold* > 0.05 unit).
3. **Penyegerakan Pusingan (Group vs Individual Progress):**
   * Walaupun berada dalam satu kumpulan, setiap jemaah mungkin berjalan pada kelajuan berbeza.
   * *Penyelesaian:* Kiraan pusingan disimpan secara individu untuk setiap pemain, namun status pusingan ketua kumpulan dipaparkan pada HUD sebagai rujukan bersama.

---

### 4. ❓ Soalan Penjelasan (Sebelum Pelaksanaan)

1. **Peranan Mutawwif / Ketua Kumpulan:**
   * Adakah pencipta kumpulan secara automatik diangkat sebagai "Mutawwif" (dengan ikon bendera 🚩 di atas kepala), atau adakah sesiapa sahaja boleh memilih peranan tersebut?
2. **Panduan Doa (Teks vs Audio):**
   * Untuk fasa MVP pertama, adakah memadai dengan paparan teks doa/zikir pada skrin HUD, atau anda mahu sokongan fail audio MP3 (talbiyah / doa) disertakan sekali?

---

> ℹ️ *Jika anda berpuas hati dengan hala tuju dan rangka seni bina di atas, anda boleh klik butang **'🚀 Laksana (Execute)'** atau taip **/execute** pada bila-bila masa untuk memulakan fasa penjanaan fail dan kod fizikal projek.*

---


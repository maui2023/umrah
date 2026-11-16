# 🕋 Simulasi Ibadah Umrah 3D (Masjidil Haram)

Aplikasi simulasi interaktif 3D ibadah Umrah berasaskan web (*serverless* statik) dengan seni bina **Public World** dan **Sistem Rombongan / Kumpulan (Groups)**. Dibina menggunakan **Vite**, **TypeScript**, dan **Three.js**, sedia untuk dideploy 100% percuma di **GitHub Pages** melalui GitHub Actions CI/CD automatik.

---

## ✨ Ciri-Ciri Utama

1. **Avatar 3D Low-Poly Berdasarkan Syariat**:
   - **Lelaki**: Memakai dua helai kain ihram putih (*Izar* & *Rida'*) dengan sunnah Idtiba' (bahu kanan terbuka).
   - **Wanita**: Pakaian ihram lengkap menutup aurat (jubah longgar serba putih dan tudung/hijab labuh yang sopan).
   - Animasi pergerakan prosedur: Berdiri santai (*idle*), berjalan (*walk*), dan berlari-lari anak (*harwalah/raml*).
   - **Tag Terapung Di Atas Kepala (*Name Tag*)**: Menampilkan nama jemaah, badge kumpulan dengan warna tema, ikon ketua 🚩 (*Mutawwif*), dan pusingan semasa.
   - **Gelung Warna Di Bawah Kaki (*Ground Halo Ring*)**: Memudahkan pengecaman rakan serombongan dari jauh dalam lautan jemaah.

2. **Public World & Sistem Rombongan (Groups)**:
   - **Satu Dunia Awam Dikongsi**: Semua jemaah bergerak bersama di Dataran Mataf dan Galeri Mas'a.
   - **Pilihan Masuk**: Boleh masuk secara **Solo**, **Sertai Kumpulan Sedia Ada** (menggunakan kod pendek), atau **Cipta Kumpulan Baharu** (menjadi Mutawwif).
   - **Kompas Arah Mutawwif (Follow Mutawwif HUD)**: Menunjukkan anak panah kompas berarah dan jarak meter ke ketua kumpulan sekiranya jemaah terpisah.
   - **Penstriman Realtime Supabase**: Menyokong penyiaran koordinat pada 11-12Hz dengan *linear interpolation (lerp)*.
   - **Mod Jemaah Maya Pintar**: Berfungsi penuh tanpa internet atau kunci API dengan rombongan jemaah maya (*AI Companions*) yang melakukan Tawaf dan Sa'i bersama-sama.

3. **Alur Ibadah Umrah Lengkap & Pengesahan Pusingan**:
   - 🕊️ **Niat & Ihram di Miqat**: Lafaz niat umrah dan laungan Talbiyah.
   - 🕋 **Tawaf 7 Pusingan**: Mula di Garisan Hajarul Aswad (Kaabah di sebelah kiri), doa Rukun Yamani, doa khusus setiap pusingan 1 hingga 7, dan pengesahan sudut anti-patah balik.
   - 🕌 **Solat Sunat Tawaf & Air Zamzam**: Solat sunat di belakang Maqam Ibrahim dan adab/doa minum air Zamzam.
   - 🏃‍♂️ **Sa'i 7 Pusingan (Safa ➔ Marwah)**: Mendaki Safa, doa menghadap kiblat, zon lampu hijau (*Batn al-Wadi*) di mana lelaki disunatkan berlari anak, tamat di Marwah.
   - ✂️ **Tahallul**: Menggunting rambut / bercukur.
   - 🏆 **Sijil Digital Umrah Mabrur**: Sijil pencapaian tamat ibadah umrah maya yang boleh dicetak / disimpan.

4. **Audio & UI Interaktif**:
   - Web Audio API synthesizers untuk takbir istilam, alunan talbiyah, amaran lampu hijau sa'i, dan bunyi ambien Masjidil Haram.
   - Sokongan pembacaan suara (*Text-to-Speech*) untuk panduan doa.
   - Kawalan dwimod: Papan kekunci & tetikus (Desktop) serta *Virtual Joystick* & butang sentuh (Telefon Pintar/Tablet).

---

## 🎮 Kawalan Pemain

| Peranti | Tindakan | Kawalan |
|---|---|---|
| **Desktop** | Gerak Hadapan/Kiri/Belakang/Kanan | `W` `A` `S` `D` atau Kekunci Anak Panah |
| **Desktop** | Lari Anak (*Harwalah / Raml*) | Tahan `Shift` |
| **Desktop** | Pusing Pandangan Kamera | Seret Tetikus (*Mouse Drag*) |
| **Desktop** | Zoom Kamera Dekat / Jauh | Roda Tetikus (*Mouse Wheel*) |
| **Mobile / Tablet** | Gerak 360° | Virtual Joystick (Kiri Skrin) |
| **Mobile / Tablet** | Lari Anak | Butang Pantas ⚡ (Kanan Bawah) |
| **Mobile / Tablet** | Pusing Pandangan Kamera | Seret Skrin (Kanan Skrin) |

---

## 🛠️ Pembangunan & Menjalankan Projek Tempatan

### Prasyarat:
- Node.js (v18 ke atas disyorkan)
- npm

### 1. Pasang Kebergantungan:
```bash
npm install
```

### 2. Jalankan Pelayan Pembangunan:
```bash
npm run dev
```
Buka pelayar di `http://localhost:3000`.

### 3. Bina untuk Pengeluaran (*Production Build*):
```bash
npm run build
```
Hasil binaan disimpan dalam direktori `dist/` dengan saiz ultra-ringan (~212KB gzip).

### 4. Uji Binaan Pengeluaran:
```bash
npm run preview
```

---

## 🌐 Konfigurasi Supabase Realtime (Pilihan)

Aplikasi ini sedia beroperasi terus tanpa sebarang konfigurasi pelayan (*offline-ready*). Jika anda ingin menghubungkan pelayan Supabase Realtime anda sendiri:

1. Salin `.env.example` kepada `.env`:
   ```bash
   cp .env.example .env
   ```
2. Masukkan URL dan Kunci Anon Supabase anda:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 🚀 Automasi Deployment GitHub Pages (CI/CD)

Alur kerja GitHub Actions telah disediakan dalam fail [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Setiap kali anda menolak (*push*) perubahan ke cawangan `main`:
1. GitHub Actions akan memasang kebergantungan secara automatik.
2. Membina aplikasi menggunakan `npm run build`.
3. Menghantar fail `dist` ke GitHub Pages secara automatik.

Pastikan pada tetapan repositori GitHub anda:
- Pergi ke **Settings** ➔ **Pages**.
- Pilih **Source: GitHub Actions**.

---

## 📜 Rujukan Syariat & Sanad Ibadah
Semua susunan rukun, syarat sah, doa pusingan tawaf, sa'i, dan adab ihram dalam simulasi ini disusun mengikut panduan Mazhab Syafi'i dan amalan rasmi Tabung Haji serta Kementerian Haji dan Umrah Arab Saudi.

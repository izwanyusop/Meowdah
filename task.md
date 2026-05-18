# 📝 Senarai Tugasan Pembangunan: Meowdah.my (Task List)

Senarai tugasan di bawah diatur mengikut 5 fasa pembangunan yang telah dipersetujui. Kita akan menjejaki kemajuan tugasan ini di setiap sesi pembangunan.

---

## 🟢 FASA 1: Setup Rangka Projek & PWA Boilerplate
*Status Keseluruhan: `COMPLETED`*

- `[x]` Inisialisasi fail projek Next.js di folder workspace
  - `[x]` Jalankan `npx -y create-next-app@latest ./ --typescript --eslint --src-dir --app --use-npm`
  - `[x]` Bersihkan fail boilerplate standard (buang fail CSS asal yang tidak berkenaan)
- `[x]` Persediaan & Konfigurasi Progressive Web App (PWA)
  - `[x]` Pasang dependencies `@ducanh2912/next-pwa` atau `@serwist/next`
  - `[x]` Rekaan & penjanaan fail `manifest.json` (nama, warna oyen primer, app icons, standalone mode)
  - `[x]` Daftar Service Worker untuk keupayaan offline cache
- `[x]` Reka Bentuk Sistem CSS Global (Vanilla CSS & CSS Modules)
  - `[x]` Tulis CSS variables untuk Warm Amber & Cream Palette di `globals.css` (Oyen Orange `#FF8C32`)
  - `[x]` Import Google Fonts Outfit (Tajuk) & Inter (Teks biasa)
  - `[x]` Cipta susun atur Layout global yang mesra mobile dan desktop (Mobile-First responsive wrapper)
- `[x]` Setup & Inisialisasi Graphifyy (Codebase Architecture Map)
  - `[x]` Jalankan `pip install graphifyy` untuk pasang perisian pemetaan seni bina
  - `[x]` Lakukan pemetaan awal projek menggunakan `graphifyy .` bagi membina fail `graphify-out/graph.html`
  - `[x]` Tambah script `"graph": "graphifyy ."` ke dalam `package.json` untuk pengemaskinian masa depan

---

## 🟢 FASA 2: Pangkalan Data (Supabase) & Pintu Masuk Auth (Google Login)
*Status Keseluruhan: `COMPLETED (Sedia Diuji)`*

- `[x]` Penggubalan Fail Skrip SQL Supabase (Database Migrations)
  - `[x]` Cipta skrip jadual `profiles` (storefront slugs, verified breeder status)
  - `[x]` Cipta skrip jadual `ads` (lencana kesihatan, baka kucing, is_featured, is_urgent)
  - `[x]` Cipta skrip jadual `chats` & `messages` (inbox realtime)
  - `[x]` Cipta skrip jadual `reports` (sistem aduan anti-scam)
  - `[x]` Cipta skrip jadual `system_settings` (penyimpanan encryted API keys ToyyibPay/Billplz)
  - `[x]` Konfigurasikan polisi PostgreSQL Row-Level Security (RLS) bagi semua jadual
- `[x]` Setup Next.js Supabase SDK Utility
  - `[x]` Bina fail pembantu client-side & server-side Supabase client (`@supabase/ssr`)
- `[x]` Pembangunan Screen 7: Halaman Auth (Daftar & Log Masuk)
  - `[x]` Bina antaramuka login bertema Oyen yang sangat premium
  - `[x]` Integrasikan Google OAuth redirect login
  - `[x]` Bina API route callback untuk menguruskan sesi token masuk secara selamat (HttpOnly cookies)

---

## 🟢 FASA 3: Pembangunan UI Core Frontend (Homepage, Search & Details)
*Status Keseluruhan: `NOT STARTED`*

- `[ ]` Pembangunan Screen 1: Homepage (Laman Utama)
  - `[ ]` Bina Header PWA dengan logo Meowdah.my yang premium
  - `[ ]` Bina bar carian gergasi & pemilih lokasi pantas
  - `[ ]` Grid kategori berbentuk ikon bulat (Kucing, Makanan, Aksesori, Servis)
  - `[ ]` Slaid Carousel iklan premium (Featured Ads) & senarai grid iklan terkini
- `[ ]` Pembangunan Screen 2: Search Results & Filter (Halaman Carian)
  - `[ ]` Urus grid senarai iklan dengan paparan harga, lokasi, & gambar
  - `[ ]` Pembangunan mobile bottom-sheet untuk tapisan (baka, umur, vaksin, neutered)
  - `[ ]` Integrasikan carian Geolocation (radius jarak km dari lokasi user)
- `[ ]` Pembangunan Screen 3: Ad Details Page (Perincian Iklan)
  - `[ ]` Slaid galeri gambar carousel kucing
  - `[ ]` Paparan status lencana kesihatan (Health badges) berwarna mint green
  - `[ ]` Kotak profil penjual dengan pautan storefront & butang WhatsApp pintas
  - `[ ]` Integrasi peta lokasi (OpenStreetMap) untuk petunjuk titik COD
- `[ ]` Pembangunan Screen 8: Public Seller Profile (Storefront Penjual)
  - `[ ]` Paparan storefront "Pro Niaga" dengan nama kedai, biografi, & banner kedai
  - `[ ]` Grid senarai semua iklan yang sedang dijual oleh penjual tersebut

---

## 🟢 FASA 4: Borang WebP Posting, Realtime Chat & Dashboard Admin
*Status Keseluruhan: `NOT STARTED`*

- `[ ]` Pembangunan Screen 4: Borang Post Ad (Buat Iklan)
  - `[ ]` Bina borang multi-langkah interaktif
  - `[ ]` Integrasikan **Client-side WebP Compressor** (Canvas API)
  - `[ ]` Integrasikan **EXIF GPS Metadata Stripper** demi keselamatan privasi
  - `[ ]` Pasang **Auto-Watermark Generator** (menampal logo `Meowdah.my` separa telus pada gambar)
- `[ ]` Pembangunan Screen 5: Seller Dashboard / Ad Manager (Pengurusan Iklan)
  - `[ ]` Bina tab Iklan Aktif, Tamat Tempoh, & SOLD
  - `[ ]` Tambah keupayaan edit iklan, delete, atau tukar status SOLD
- `[ ]` Pembangunan Screen 6: Live Inbox Chat Room (Inbox Realtime)
  - `[ ]` Reka dwi-panel inbox chat
  - `[ ]` Integrasikan Supabase Realtime subscription untuk hantar & terima mesej serta-merta
- `[ ]` Pembangunan Screen 9: Admin Dashboard (Moderasi & Settings Gateway)
  - `[ ]` Bina senarai moderasi laporan iklan (suspend scammer)
  - `[ ]` Bina portal meluluskan badge Verified Breeder
  - `[ ]` Bina **Panel Dynamic Payment Settings** untuk admin masukkan Secret Keys ToyyibPay / Billplz

---

## 🟢 FASA 5: Payment Gateway & Vercel Live Launch
*Status Keseluruhan: `NOT STARTED`*

- `[ ]` Integrasi Payment Gateway API Routes
  - `[ ]` API route untuk menjana pautan pembayaran ToyyibPay (FPX) dinamik dari DB settings
  - `[ ]` API route untuk menjana pautan pembayaran Billplz (FPX) dinamik dari DB settings
- `[ ]` Integrasi Secure Webhook Endpoint Callback
  - `[ ]` API route menerima isyarat callback transaksi dari gateway
  - `[ ]` Logik auto-bump atau tukar status Featured Ad pasca pembayaran berjaya
- `[ ]` Pengujian Akhir & Lighthouse Optimization
  - `[ ]` Uji transaksi sandbox ToyyibPay/Billplz di Screen 9
  - `[ ]` Pengesahan keserasian PWA (offline capability & splash screens)
- `[ ]` Live Deployment ke Vercel
  - `[ ]` Sambungkan repositori GitHub ke Vercel & lancarkan laman live!

---

## 📝 Rekod Kemajuan Semasa
* **Fasa 1:** `100%`
* **Fasa 2:** `100% (Sedia Diuji)`
* **Fasa 3:** `0%`
* **Fasa 4:** `0%`
* **Fasa 5:** `0%`

# 🏆 World-Class Programmer Rules & Standards: Meowdah.my

Dokumen ini berfungsi sebagai **Protokol Pembangunan Bertaraf Dunia** (World-Class Development Skill & Rules). Ia menggariskan standard kualiti tinggi, seni bina bersih (*clean architecture*), garis panduan keselamatan gred enterprise, dan amalan terbaik pembangunan Next.js + Supabase yang wajib dipatuhi oleh pembangun (AI & Manusia) dalam projek Meowdah.my.

---

## 1. 🏗️ Seni Bina Kod Bersih (Clean Architecture)

### 1.1 Pemisahan Kebimbangan (Separation of Concerns - SoC)
Setiap fail dan modul kod wajib mematuhi pemisahan tanggungjawab yang sangat tegas:
* **UI Pages (`src/app/`)**: Hanya bertanggungjawab untuk *routing*, susun atur visual (*layouts*), dan memanggil modul servis. Sifar (*zero*) raw database queries di dalam fail page.
* **Reusable Components (`src/components/`)**: Boleh dikitar semula, sifar logic perniagaan global, bersifat *stateless* seboleh-bolehnya, dan menerima tindakan melalui *callbacks* / *props*.
* **Business Logic & API Services (`src/lib/services/`)**: Pengkalan data, API fetches, dan logic kritikal disentralisasikan di sini (contoh: `adService.ts`, `chatService.ts`).
* **Custom Hooks (`src/lib/hooks/`)**: Sebarang logic state client-side yang mempunyai *effects* (`useEffect`) atau real-time subscription wajib dibungkus di dalam Custom Hook khusus (contoh: `useRealtimeChat.ts`).

### 1.2 Kod TypeScript Tegas (Strict TypeScript)
* **Tiada Penggunaan `any`**: Penggunaan jenis data `any` adalah dilarang sama sekali. Gunakan jenis data yang tepat, generic types (`T`), atau `unknown` dengan pengesahan jenis (*type guards*).
* **Definisi Interfaces & Types**: Cipta fail jenis data khusus di `/src/types/` untuk model database dan struktur aplikasi bagi menjamin auto-completion yang jitu di seluruh projek.

---

## 2. 🎨 Standard UI/UX & Sistem Reka Bentuk (Visual Excellence)

### 2.1 Palet Warna Premium (Oyen Warm Amber Theme)
Dilarang menggunakan warna generik (seperti oren asas `#orange`, merah kosong `#red`). Gunakan palet curated premium:
* 🟧 **Primary Oyen Orange:** `#FF8C32` — Warna tindakan utama (CTA).
* 🟫 **Secondary Ginger Amber:** `#E07A2F` — Warna kesan hover.
* 🟩 **Accent Mint Green:** `#2ECC71` — Warna lencana kesihatan & status verified.
* 🥛 **Neutral Cream Background:** `#FFF8F3` — Latar belakang platform yang selesa pada mata.
* ⬛ **Neutral Dark Charcoal:** `#2D2D2D` — Teks utama yang mesra retina.

### 2.2 Tipografi & Responsif Mobile-First
* **Sistem Font:** Outfit (Tajuk & Penjenamaan) untuk estetika mesra haiwan yang premium, Inter (Teks & Data) untuk kejelasan bacaan maksima.
* **Layout Mobile-First:** Reka bentuk UI wajib di-optimize untuk peranti mudah alih (iOS/Android PWA) terlebih dahulu, kemudian diskalakan secara harmoni untuk skrin desktop menggunakan flexbox dan grid Vanilla CSS.

### 2.3 Micro-Animations & Interaksi Dynamic
* Semua butang, kad, dan elemen klik wajib mempunyai **kesan peralihan lancar** (transition duration `0.2s ease-in-out`).
* Sediakan kesan hover, active, and loading skeleton yang kemas bagi memberikan tindak balas visual masa-nyata yang "hidup" kepada pengguna.

---

## 3. 🛡️ Protokol Keselamatan Gred Enterprise (Security Protocol)

### 3.1 Keselamatan Sesi & Identiti
* **Google OAuth**: Tiada simpanan kata laluan tempatan bagi menghalang serangan kebocoran data (*data leaks*).
* **JWT & HttpOnly Cookies**: Token sesi diuruskan oleh Supabase Auth menggunakan kuki selamat dengan atribut `HttpOnly`, `Secure`, dan `SameSite=Lax`.

### 3.2 Polisi Keselamatan Database (Row-Level Security - RLS)
Setiap jadual PostgreSQL di Supabase **wajib mengaktifkan RLS**. Polisi standard:
* **profiles**:
  - `SELECT`: Sesiapa sahaja (awam).
  - `INSERT/UPDATE`: Hanya pengguna yang sepadan dengan `auth.uid() = id`.
* **ads**:
  - `SELECT`: Sesiapa sahaja (jika iklan bertanda aktif).
  - `INSERT/UPDATE`: Hanya penjual pemilik iklan di mana `auth.uid() = seller_id`.
  - *Sifat Premium (`is_featured`)*: Dikunci daripada keupayaan update user biasa. Hanya server-side route yang mempunyai status verifikasi transaksi boleh mengubah status ini.
* **chats & messages**:
  - `SELECT/INSERT`: Terhad kepada pengguna yang terlibat sahaja (`auth.uid() = sender_id` atau `auth.uid() = receiver_id`).

### 3.3 Penapisan Input & Pemprosesan Imej Selamat
* **Strict Schema Verification**: Gunakan **Zod** untuk menapis semua request API di peringkat server bagi menghalang serangan *SQL Injection* dan *XSS*.
* **Client-Side Image Reconstruction**: Penjual memuat naik gambar -> Gambar diproses pada HTML5 Canvas (melukis semula gambar -> menukarkan ke `.webp` -> melupuskan metadata EXIF/GPS -> menampal watermark separa telus) -> Imej dihantar ke storan Supabase. Ini menjamin privasi lokasi fizikal penjual dan keselamatan fail.

---

## 4. ⚡ Pengoptimuman Prestasi & Storan (Performance & Storage)

### 4.1 Jimat Kos Storan & Data
* **Auto-WebP Quality 80%**: Format WebP yang di-optimize mengurangkan saiz fail gambar sehingga 70% tanpa menjejaskan visual kucing, sekali gus memaksimumkan penggunaan storan free-tier Supabase (1GB).
* **React Server Components (RSC)**: Memindahkan 80% data fetching ke server. Client-side browser hanya menerima HTML terkompresi, menjimatkan kuota internet pengguna dan bateri telefon.

### 4.2 Peta Lokasi Percuma
* Gunakan OpenStreetMap API bersepadu dengan peta Leaflet (sifar kos API) untuk carian berjarak radius geolokasi, mengelakkan yuran mahal Google Maps API.

---

## 5. 📊 Pipeline Integrasi Graphifyy (Anti-Spaghetti Engine)

Bagi menjamin kod kekal modular, setiap akhir fasa pembangunan utama **wajib melalui proses visualisasi**:
1. Jalankan `npm run graph` (menjalankan `graphifyy .`).
2. Sila semak output fail `graphify-out/graph.html` dan `GRAPH_REPORT.md`.
3. **Kriteria Kelulusan Reka Bentuk Kod (Coding Approval Criteria):**
   - **Tiada Hubungan Silang Haram (Zero Forbidden Cross-Imports):** UI views tidak boleh mengimport raw db settings secara terus.
   - **God Nodes Identification:** Sebarang fail komponen yang bersaiz > 400 baris kod (kelihatan sebagai bulatan node gergasi di dalam graf) mestilah dipecahkan (*refactored*) kepada sub-komponen modular.
   - **Zero Circular Dependencies:** Tiada fail A mengimport B dan fail B mengimport semula fail A.

---

## 🏆 Moto Pembangunan:
> **"Tulis kod seolah-olah pengaturcara yang akan menyelenggara kod anda selepas ini adalah seorang pembengis yang tahu di mana anda tinggal."**
> 
> *Tulis kod bersih, modular, selamat, dan dipetakan secara visual.*

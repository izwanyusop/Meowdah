# 📄 Product Requirement Document (PRD): Meowdah.my

---

## 📑 Maklumat Dokumen
* **Nama Produk:** Meowdah.my
* **Tujuan Dokumen:** Product Requirement Document (PRD) untuk MVP (Minimum Viable Product)
* **Status:** Draf Akhir (Menunggu Kelulusan)
* **Versi:** 1.0.0
* **Tarikh:** 18 Mei 2026

---

## 1. 🎯 Pengenalan & Visi Produk

### 1.1 Ringkasan Eksekutif
**Meowdah.my** ialah sebuah platform classifieds dan marketplace progresif (PWA) di Malaysia yang dikhususkan sepenuhnya untuk pencinta kucing (*cat lovers*). Mengambil inspirasi daripada kehebatan Mudah.my dalam urusan jual beli classifieds berasaskan lokasi, Meowdah.my dibina dengan reka bentuk premium yang moden, ciri anti-scammer yang mantap, dan sistem pengurusan iklan/pembayaran dinamik yang mesra pengguna.

### 1.2 Masalah yang Diselesaikan
* **Scammer Kucing Berleluasa:** Banyak kes penipuan berlaku di media sosial dan platform am kerana gambar kucing dicuri atau penjual palsu.
* **Carian Tidak Spesifik:** Sukar mencari kucing untuk adopsi/beli, makanan, dan servis khusus (seperti mating/hotel kucing) di satu tempat yang berdekatan.
* **Privasi Terdedah:** Penjual terpaksa mendedahkan nombor telefon/WhatsApp terus kepada umum, membawa kepada isu spam dan keselamatan.
* **Kos Operasi Tinggi:** Startup baharu sering dibebani kos bulanan server dan database yang mahal.

### 1.3 Objektif MVP (Minimum Viable Product)
1. Membina platform gred enterprise dengan **Kos Operasi Bulanan RM0** (menggunakan pelan percuma Vercel & Supabase).
2. Membina aplikasi web installable (**PWA**) yang pantas dan di-optimize untuk peranti mudah alih.
3. Menyediakan carian *hyper-local* (mengikut Negeri dan Bandar di Malaysia).
4. Menyediakan sistem moderasi yang selamat bagi menyekat aktiviti penipuan (scam).
5. Membolehkan pentadbir (Admin) mengkonfigurasi Payment Gateway (ToyyibPay/Billplz) secara dinamik melalui UI.

---

## 2. 👥 Golongan Sasaran & Persona Pengguna

* **Pencinta Kucing Tempatan (Pet Parents):** Mencari makanan kucing, pasir, aksesori murah, servis hotel kucing (boarding), atau khidmat mating.
* **Breeder Berdaftar / Pro Niaga:** Cattery berlesen yang mahu mempromosikan baka kucing premium (BSH, Maine Coon, Parsi) kepada pembeli yang serius.
* **Penyelamat Haiwan (Rescuers/Shelters):** Mahu mengiklankan kucing jalanan untuk adopsi percuma (*Adopt, Don't Shop*).
* **Pemilik Kedai Haiwan (Pet Shops):** Mahu menjual barangan fizikal (makanan & sangkar) secara tempatan.

---

## 3. 🛠️ Spesifikasi Fungsian (Functional Requirements)

### F1: Log Masuk & Profil (Auth & Onboarding)
* **F1.1 Google Login (Supabase OAuth):** Pengguna boleh daftar dan log masuk dengan sekali klik melalui akaun Google.
* **F1.2 User Profile:** Pengguna boleh menetapkan nama, gambar profil, nombor telefon (tersembunyi secara lalai), dan negeri kediaman asal.
* **F1.3 Seller Profile (Pro Niaga):** Kedai/Breeder berdaftar boleh memaparkan banner kedai, pautan tersuai (`/store/nama-kedai`), biografi, rating, dan semua iklan aktif mereka.

### F2: Enjin Carian & Penapis Hyper-Local (Search & Filter Engine)
* **F2.1 Carian Teks Bebas:** Carian pantas mengikut kata kunci tajuk iklan.
* **F2.2 Filter Lokasi:** Pilihan carian bertapis mengikut **Negeri** (Selangor, Johor, dll) dan **Bandar** (Shah Alam, JB, dll).
* **F2.3 Filter Kategori Khas Kucing:**
  - *Baka Kucing* (BSH, Parsi, Domestic, dll).
  - *Umur* (Kitten vs Adult).
  - *Lencana Kesihatan* (Vaccinated, Neutered, Dewormed).
* **F2.4 Penapis Jarak (Geolocation "Near Me"):** Menggunakan koordinat GPS telefon untuk mencari barangan/kucing dalam radius 5km, 10km, atau 20km.

### F3: Pengurusan Catatan Iklan (Listing & Ad Creation)
* **F3.1 Borang Post Ad Multi-Langkah:** Borang mesra pengguna untuk memuat naik iklan.
* **F3.2 Auto-Conversion ke WebP (Client-side):** Semua fail gambar ditukarkan ke format WebP (kualiti 80%) secara automatik di pelayar sebelum dimuat naik bagi menjimatkan kuota storage Supabase.
* **F3.3 Stripping Metadata EXIF:** Semua maklumat koordinat GPS asal di dalam gambar dibuang secara automatik semasa penukaran WebP demi keselamatan privasi rumah penjual.
* **F3.4 Auto-Watermarking:** Teks semi-transparent (`Meowdah.my - @username`) ditampal secara automatik pada gambar iklan untuk mengelak kecurian imej oleh scammer.

### F4: Sistem Sembang & WhatsApp Fallback (Communication System)
* **F4.1 Live In-App Chat:** Sistem chat masa-nyata (Supabase Realtime) membolehkan pembeli dan penjual berunding secara langsung dalam apps.
* **F4.2 WhatsApp Shortcut Template:** Butang hubungi melalui WhatsApp yang secara automatik membuka aplikasi WhatsApp penjual dengan pesanan template sedia ada:
  > *"Salam, saya berminat dengan iklan [Nama Kucing/Barang] berharga [Harga] di Meowdah.my. Boleh COD? [Pautan Iklan]"*

### F5: Model Perniagaan & Pengaktifan Iklan Premium (Monetization Boosters)
* **F5.1 Had Iklan Percuma:** Pengguna biasa dihadkan kepada maksimum 3 iklan aktif serentak.
* **F5.2 Bump Ad:** Pembayaran sekali (RM3 - RM5) untuk menolak tarikh iklan menjadi yang terkini (push-to-top).
* **F5.3 Featured Ad:** Iklan premium yang diletakkan di ruangan atas homepage dengan sempadan khas (RM10 - RM15 seminggu).
* **F5.4 Urgent Ad:** Penambahan tag kuning/merah "URGENT" pada iklan (RM5 sekali guna).
* **F5.5 Pelan Pro Niaga:** Langganan bulanan bagi melepaskan had slot iklan percuma dan mengaktifkan kedai tersuai.

### F6: Konfigurasi Pintu Gerbang Pembayaran Dinamik (Admin-configured Payment Settings)
* **F6.1 Admin Panel Setup:** Admin boleh memasukkan data API Key ToyyibPay / Billplz secara dinamik terus di skrin admin.
* **F6.2 dynamic Credentials Loading:** Server Next.js membaca kelayakan aktif daripada pangkalan data Supabase secara selamat (di bawah kawalan RLS) semasa pengguna mahu membuat pembayaran, tanpa memerlukan kod dikemas kini secara keras.

### F7: Moderasi & Keselamatan Admin (Admin Moderation Dashboard)
* **F7.1 Laporan Iklan (Report Ad):** Pengguna boleh menekan butang lapor iklan sekiranya disyaki scam atau melanggar terma.
* **F7.2 Auto-Suspend Threshold:** Iklan yang menerima laporan bertubi-tubi (contoh: > 5 laporan) akan digantung secara automatik sementara menunggu semakan admin.
* **F7.3 Moderasi Senarai:** Admin boleh menolak laporan atau memadam iklan yang disahkan melanggar peraturan.
* **F7.4 Verified Breeder Approval:** Admin boleh menyemak dokumen breeder yang memohon lencana *Verified Breeder* dan meluluskan/menolak permohonan tersebut.

---

## 4. 📈 Spesifikasi Bukan Fungsian (Non-Functional Requirements)

### 4.1 Prestasi (Performance)
* **Waktu Muat Laman (Page Load Time):** Homepage mestilah dimuatkan dalam masa kurang dari 1.5 saat menggunakan Next.js SSR & image caching.
* **Kecil & Ringan:** Pakej PWA mestilah ringan agar tidak memakan ruang memori yang besar di telefon pengguna.

### 4.2 Keselamatan (Security)
* **Supabase RLS (Row-Level Security):** RLS wajib diaktifkan pada semua jadual pangkalan data. Pengguna biasa dilarang sama sekali daripada menulis data pengguna lain atau mengubah ruangan premium (`is_featured`) iklan mereka.
* **API Key Encryption:** Kunci API payment gateway (ToyyibPay/Billplz) yang dimasukkan admin akan disimpan dalam keadaan disulitkan (*encrypted*) di PostgreSQL.
* **HTTPS & CORS:** Semua request dipaksa melalui HTTPS (Vercel) dan sekatan CORS diaktifkan pada Supabase bagi menghalang capaian haram dari domain asing.

### 4.3 Ketersediaan (PWA & Offline)
* **Installability:** Aplikasi mesti memenuhi standard Google PWA (mempunyai manifest.json dan service worker yang sah).
* **Offline Cache:** Pengguna masih boleh membuka dashboard iklan mereka sendiri secara offline.

### 4.4 Pemetaan & Audit Seni Bina (Graphifyy)
* **Dependency Mapping:** Projek disepadukan dengan `graphifyy` untuk memeta hubung kait kod Next.js, imports, dan fail pangkalan data.
* **Laporan Kualiti (Quality Auditing):** Melalui visualisasi Leiden clustering (`graph.html`), pembangun (AI dan User) boleh memantau jika wujud pengimportan kitaran (*circular imports*) atau reka bentuk fail yang melanggar standard.

---

## 5. 🗄️ Rangka Struktur Pangkalan Data (Database Schema Draft)

Berikut ialah cadangan 6 jadual asas PostgreSQL yang akan disetup di Supabase:

### Jadual `profiles`
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  state TEXT,
  city TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  is_verified_breeder BOOLEAN DEFAULT FALSE,
  store_slug TEXT UNIQUE,
  store_banner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### Jadual `ads`
```sql
CREATE TABLE ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL, -- Kucing, Makanan, Aksesori, Servis
  subcategory TEXT, -- Mating, Dry Food, BSH, dll
  breed TEXT,
  age_months INTEGER,
  is_vaccinated BOOLEAN DEFAULT FALSE,
  is_neutered BOOLEAN DEFAULT FALSE,
  images TEXT[] NOT NULL, -- Array WebP URLs
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMP WITH TIME ZONE,
  is_urgent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### Jadual `chats` & `messages`
```sql
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### Jadual `reports`
```sql
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### Jadual `system_settings` (Tetapan Sulit Admin)
```sql
CREATE TABLE system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  active_gateway TEXT DEFAULT 'toyyibpay', -- toyyibpay, billplz, none
  toyyibpay_secret_key TEXT, -- Encrypted
  toyyibpay_category_code TEXT,
  billplz_api_key TEXT, -- Encrypted
  billplz_collection_id TEXT,
  billplz_x_signature TEXT, -- Encrypted
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT single_row CHECK (id = 1) -- Menjamin hanya 1 baris setting wujud
);
```

---

## 6. 🗺️ Pelan Fasa Seterusnya (Post-MVP Roadmap)

* **Fasa 1.5:** Integrasi sistem pengulasan (*Ratings & Reviews*) bagi profil penjual / Pro Niaga bagi mengukuhkan lagi faktor kepercayaan pembeli.
* **Fasa 2.0:** Pelancaran **"MeowPay" Escrow** secara live dengan sistem FPX dan E-Wallet bagi menghentikan kes scam COD di Malaysia secara total.
* **Fasa 2.5:** Integrasi khidmat penghantaran pet taxi (*Pet Taxi Booking Integration*) terus di dalam apps bagi memudahkan buyer menerima kucing.

---

## ❓ Semakan Semula PRD

> [!NOTE]
> Dokumen PRD ini telah digubal dengan teliti untuk menggabungkan maklum balas dinamik payment gateway, penukaran automatik WebP, dan moderasi Halaman Admin.
> 
> Sila sahkan dokumen ini dengan menaip **"Approve"** untuk kita mulakan pembangunan!

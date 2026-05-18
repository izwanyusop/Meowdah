-- ==========================================
-- MEOWDAH.MY DATABASE MIGRATION SCHEMA (FASA 2)
-- ==========================================
-- Salin seluruh kandungan fail ini, tampal ke dalam
-- Supabase SQL Editor (Dashboard > SQL Editor > New Query),
-- kemudian tekan tombol "RUN".

-- Bersihkan data lama jika ada (Sila berhati-hati dalam production)
-- drop table if exists public.system_settings cascade;
-- drop table if exists public.reports cascade;
-- drop table if exists public.messages cascade;
-- drop table if exists public.chats cascade;
-- drop table if exists public.ads cascade;
-- drop table if exists public.profiles cascade;

-- ==========================================
-- 1. JADUAL PROFIL PENGGUNA (profiles)
-- ==========================================
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique not null,
    full_name text,
    avatar_url text,
    is_verified_breeder boolean default false not null,
    is_admin boolean default false not null,
    
    -- Kedai/Pro Niaga Details
    store_name text,
    store_bio text,
    store_banner text,
    whatsapp_number text,
    
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mengaktifkan RLS
alter table public.profiles enable row level security;

-- ==========================================
-- 2. JADUAL IKLAN KUCING & KEPERLUAN (ads)
-- ==========================================
create table public.ads (
    id uuid default gen_random_uuid() primary key,
    seller_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    price numeric(10, 2) not null default 0.00 check (price >= 0),
    category text not null, -- 'Kucing', 'Makanan', 'Aksesori', 'Servis'
    breed text, -- cth: 'BSH', 'Persian', 'Munchkin', 'Domestic Short Hair', etc.
    age_months integer check (age_months >= 0),
    
    -- Health Badges (Lencana Kesihatan)
    is_vaccinated boolean default false not null,
    is_neutered boolean default false not null,
    
    -- Media (WebP Optimized URLs)
    images text[] not null default '{}'::text[],
    
    -- Lokasi COD Hyper-local
    state text not null, -- cth: 'Selangor', 'Kuala Lumpur', 'Johor'
    city text not null,  -- cth: 'Shah Alam', 'Cheras'
    latitude double precision,
    longitude double precision,
    
    -- Kedudukan Iklan (Booster & Monetization)
    is_featured boolean default false not null,
    is_urgent boolean default false not null,
    
    -- Status
    status text default 'active' not null check (status in ('active', 'expired', 'sold', 'pending')),
    
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mengaktifkan RLS
alter table public.ads enable row level security;

-- ==========================================
-- 3. JADUAL LIVE CHAT ROOM (chats)
-- ==========================================
create table public.chats (
    id uuid default gen_random_uuid() primary key,
    ad_id uuid references public.ads(id) on delete cascade not null,
    buyer_id uuid references public.profiles(id) on delete cascade not null,
    seller_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Kekangan: Buyer dan Seller tidak boleh orang yang sama
    constraint chk_buyer_seller_different check (buyer_id <> seller_id),
    -- Kekangan: Satu chat room sahaja bagi setiap gabungan ad + buyer + seller
    constraint uq_ad_buyer_seller unique (ad_id, buyer_id, seller_id)
);

-- Mengaktifkan RLS
alter table public.chats enable row level security;

-- ==========================================
-- 4. JADUAL MESEJ CHAT (messages)
-- ==========================================
create table public.messages (
    id uuid default gen_random_uuid() primary key,
    chat_id uuid references public.chats(id) on delete cascade not null,
    sender_id uuid references public.profiles(id) on delete cascade not null,
    content text not null,
    is_read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mengaktifkan RLS
alter table public.messages enable row level security;

-- ==========================================
-- 5. JADUAL LAPORAN ANTI-SCAM (reports)
-- ==========================================
create table public.reports (
    id uuid default gen_random_uuid() primary key,
    ad_id uuid references public.ads(id) on delete cascade not null,
    reporter_id uuid references public.profiles(id) on delete cascade not null,
    reason text not null, -- cth: 'Scammer', 'Harga Palsu', 'Bukan Kucing', 'Spam'
    description text,
    status text default 'pending' not null check (status in ('pending', 'resolved', 'dismissed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    resolved_at timestamp with time zone
);

-- Mengaktifkan RLS
alter table public.reports enable row level security;

-- ==========================================
-- 6. JADUAL TETAPAN SISTEM ADMIN (system_settings)
-- ==========================================
create table public.system_settings (
    key text primary key,
    value text not null,
    description text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mengaktifkan RLS
alter table public.system_settings enable row level security;

-- ==========================================
-- FUNGSI PEMBANTU (HELPER FUNCTIONS)
-- ==========================================

-- Fungsi untuk menyemak sama ada pengguna semasa adalah Admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
end;
$$ language plpgsql security definer;

-- Fungsi penciptaan profil secara automatik selepas user daftar masuk (Google OAuth)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  generated_username text;
  base_username text;
  counter integer := 0;
begin
  -- 1. Ekstrak username mentah daripada metadata email
  base_username := lower(coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  ));
  
  -- Bersihkan aksara asing agar selamat untuk URL slug
  base_username := regexp_replace(base_username, '[^a-z0-9_]', '', 'g');
  
  -- Pastikan username tidak kosong
  if base_username = '' then
    base_username := 'user';
  end if;
  
  generated_username := base_username;
  
  -- 2. Gelung untuk mengelakkan pertembungan username unik
  while exists (select 1 from public.profiles where username = generated_username) loop
    counter := counter + 1;
    generated_username := base_username || counter::text;
  end loop;

  -- 3. Masukkan rekod baru ke dalam public.profiles
  insert into public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    is_admin,
    is_verified_breeder
  )
  values (
    new.id,
    generated_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    false, -- Admin dimatikan secara lalai demi keselamatan
    false  -- Verified breeder dimatikan secara lalai
  );
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger pendaftaran akaun
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- --- POLISI PROFILES ---
create policy "Profil boleh dibaca oleh sesiapa sahaja secara umum"
    on public.profiles for select
    using (true);

create policy "Pengguna boleh mengemas kini profil sendiri sahaja"
    on public.profiles for update
    using (auth.uid() = id);

-- --- POLISI ADS ---
create policy "Iklan aktif & sold boleh dilihat oleh sesiapa sahaja"
    on public.ads for select
    using (status = 'active' or status = 'sold' or auth.uid() = seller_id);

create policy "Pengguna berdaftar boleh mencipta iklan sendiri"
    on public.ads for insert
    with check (auth.uid() = seller_id);

create policy "Penjual boleh mengemas kini iklan mereka sendiri sahaja"
    on public.ads for update
    using (auth.uid() = seller_id);

create policy "Penjual boleh memadam iklan mereka sendiri sahaja"
    on public.ads for delete
    using (auth.uid() = seller_id);

-- --- POLISI CHATS ---
create policy "Pengguna boleh melihat chat room yang melibatkan diri mereka"
    on public.chats for select
    using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Pengguna berdaftar boleh memulakan chat room sebagai pembeli"
    on public.chats for insert
    with check (auth.uid() = buyer_id);

-- --- POLISI MESSAGES ---
create policy "Pengguna boleh melihat mesej dalam chat room yang melibatkan mereka"
    on public.messages for select
    using (
        exists (
            select 1 from public.chats c
            where c.id = messages.chat_id
            and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
        )
    );

create policy "Pengguna boleh menghantar mesej dalam chat room mereka sendiri"
    on public.messages for insert
    with check (
        auth.uid() = sender_id
        and exists (
            select 1 from public.chats c
            where c.id = messages.chat_id
            and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
        )
    );

-- --- POLISI REPORTS ---
create policy "Semua pengguna boleh menghantar aduan scam"
    on public.reports for insert
    with check (auth.uid() = reporter_id);

create policy "Hanya Admin sahaja boleh melihat laporan aduan"
    on public.reports for select
    using (public.is_admin() = true);

create policy "Hanya Admin sahaja boleh mengemas kini status aduan"
    on public.reports for update
    using (public.is_admin() = true);

-- --- POLISI SYSTEM SETTINGS ---
create policy "Hanya Admin sahaja boleh melihat tetapan sistem"
    on public.system_settings for select
    using (public.is_admin() = true);

create policy "Hanya Admin sahaja boleh mengubah tetapan sistem"
    on public.system_settings for all
    using (public.is_admin() = true);

-- ==========================================
-- PRESTASI & INDEX (INDEXING FOR HIGH PERFORMANCE)
-- ==========================================
create index idx_ads_seller_id on public.ads(seller_id);
create index idx_ads_status on public.ads(status);
create index idx_ads_category_breed on public.ads(category, breed);
create index idx_chats_users on public.chats(buyer_id, seller_id);
create index idx_messages_chat_id on public.messages(chat_id);
create index idx_messages_created_at on public.messages(created_at desc);

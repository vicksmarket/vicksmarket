-- ═══════════════════════════════════════════════════
--  VICKS MARKET — إعداد قاعدة البيانات
--  افتح Supabase → SQL Editor → الصق الكود → Run
-- ═══════════════════════════════════════════════════

-- 1. جدول الملفات الشخصية (profiles)
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text,
  shop_name        text,
  photo_url        text,
  is_verified      boolean default false,
  verification_type text default 'blue',
  unique_id        text unique,
  phone            text,
  location         text,
  rating           numeric default 5.0,
  telegram         text,
  role             text default 'customer',
  is_online        boolean default false,
  created_at       timestamptz default now()
);

-- 2. جدول المنتجات (products)
create table if not exists public.products (
  id           text primary key,
  mall         text not null,
  name         text not null,
  price        numeric not null,
  category     text,
  description  text,
  image        text,
  seller       text,
  seller_id    text,
  seller_image text,
  is_online    boolean default false,
  phone        text,
  telegram     text,
  likes        int default 0,
  comments     int default 0,
  rating       numeric default 5,
  is_verified  boolean default false,
  is_gold      boolean default false,
  created_at   timestamptz default now()
);

-- 3. جدول القصص (stories)
create table if not exists public.stories (
  id           text primary key,
  seller_id    text,
  seller_name  text,
  seller       text,
  seller_image text,
  image        text,
  is_gold      boolean default false,
  phone        text,
  telegram     text,
  expires_at   timestamptz,
  created_at   timestamptz default now()
);

-- 4. جدول التعليقات (comments)
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  product_id text references public.products(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete set null,
  user_name  text default 'زائر',
  content    text not null,
  rating     int default 5,
  created_at timestamptz default now()
);

-- 5. جدول الرسائل (messages)
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid references auth.users(id) on delete cascade,
  receiver_id uuid references auth.users(id) on delete cascade,
  content     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ═══════════════════════════
--  RLS (حماية الصفوف)
-- ═══════════════════════════
alter table public.profiles  enable row level security;
alter table public.products  enable row level security;
alter table public.stories   enable row level security;
alter table public.comments  enable row level security;
alter table public.messages  enable row level security;

-- Products & Stories: قراءة عامة
create policy if not exists "public read products" on public.products for select using (true);
create policy if not exists "public read stories"  on public.stories  for select using (true);
create policy if not exists "public read comments" on public.comments for select using (true);

-- Profiles
create policy if not exists "users read own profile"   on public.profiles for select using (auth.uid() = id);
create policy if not exists "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy if not exists "public read profiles"     on public.profiles for select using (true);

-- Comments: أي أحد يعلق
create policy if not exists "anyone insert comment" on public.comments for insert with check (true);

-- Messages
create policy if not exists "users see own messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy if not exists "users send messages" on public.messages
  for insert with check (auth.uid() = sender_id);

-- ═══════════════════════════
--  Trigger: profile تلقائي عند التسجيل
-- ═══════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, shop_name, photo_url, phone, location, role, unique_id, is_verified)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'shopName',
    new.raw_user_meta_data->>'photoURL',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'location',
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'unique_id',
    (new.raw_user_meta_data->>'isVerified')::boolean
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

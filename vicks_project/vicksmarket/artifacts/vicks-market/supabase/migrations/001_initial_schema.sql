-- Vicks Market – Initial Supabase Schema
-- Run this in the Supabase SQL Editor.
-- PREREQUISITE: Set SUPABASE_SERVICE_ROLE_KEY in your deployment secrets so that
-- server actions (src/app/actions/otp-actions.ts) can bypass RLS for OTP operations.

-- ══════════════════════════════════════════════
-- Helper: is the current session an admin?
-- ══════════════════════════════════════════════
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select auth.email() in (
    'vicksmarket@gmail.com',
    'mom1113694362@gmail.com',
    'mom01113694362@icloud.com'
  );
$$;

-- ══════════════════════════════════════════════
-- 1. users
-- ══════════════════════════════════════════════
create table if not exists public.users (
  id                       uuid primary key references auth.users(id) on delete cascade,
  "fullName"               text,
  "shopName"               text,
  email                    text,
  phone                    text,
  telegram                 text,
  "photoURL"               text,
  "coverURL"               text,
  "unique_id"              text unique,
  role                     text default 'customer',
  points                   integer default 0,
  status                   text default 'active',
  "isVerified"             boolean default false,
  "verificationType"       text,
  "verificationExpiresAt"  timestamptz,
  "banExpiresAt"           timestamptz,
  "warningMessage"         text,
  "likedProducts"          text[] default '{}',
  "productsCount"          integer default 0,
  "maxProducts"            integer default 5,
  location                 text,
  "isOnline"               boolean default false,
  rating                   numeric(3,1) default 5.0,
  "createdAt"              timestamptz default now()
);

-- ══════════════════════════════════════════════
-- 2. verifications  (email OTP during signup)
-- ══════════════════════════════════════════════
create table if not exists public.verifications (
  id          uuid primary key references auth.users(id) on delete cascade,
  "emailCode" text,
  "phoneCode" text,
  role        text default 'customer',
  "createdAt" timestamptz default now()
);

-- ══════════════════════════════════════════════
-- 3–5. OTP temp tables (email reset, phone reset, signup phone)
-- NOTE: These are accessed ONLY through server actions using the service role key.
-- All client-side RLS access is denied by the restrictive policies below.
-- ══════════════════════════════════════════════
create table if not exists public.temp_resets (
  id          text primary key,   -- email
  code        text,
  "expiresAt" bigint,             -- epoch ms
  "createdAt" timestamptz default now()
);

create table if not exists public.temp_resets_phone (
  id          text primary key,   -- cleaned phone
  code        text,
  "expiresAt" bigint,
  "createdAt" timestamptz default now()
);

create table if not exists public.temp_verifications (
  id          text primary key,   -- phone number
  code        text,
  "expiresAt" timestamptz,
  "createdAt" timestamptz default now()
);

-- ══════════════════════════════════════════════
-- 6. products
-- ══════════════════════════════════════════════
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  price        numeric(12,2),
  category     text,
  description  text,
  image        text,
  "videoUrl"   text,
  seller       text,
  "sellerId"   uuid references public.users(id) on delete cascade,
  mall         text,
  location     text,
  views        integer default 0,
  likes        integer default 0,
  comments     integer default 0,
  rating       numeric(3,1) default 5.0,
  "isOriginal" boolean default false,
  "isReported" boolean default false,
  tags         text[] default '{}',
  "createdAt"  timestamptz default now()
);

-- ══════════════════════════════════════════════
-- 7. stories
-- ══════════════════════════════════════════════
create table if not exists public.stories (
  id            uuid primary key default gen_random_uuid(),
  "sellerId"    uuid references public.users(id) on delete cascade,
  "sellerName"  text,
  "sellerImage" text,
  image         text,
  "productId"   uuid references public.products(id) on delete set null,
  "isGold"      boolean default false,
  "expiresAt"   bigint,
  "createdAt"   timestamptz default now()
);

-- ══════════════════════════════════════════════
-- 8. comments
-- ══════════════════════════════════════════════
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  "productId" uuid references public.products(id) on delete cascade,
  "parentId"  uuid references public.comments(id) on delete cascade,
  "userId"    text,
  "userName"  text,
  text        text,
  rating      integer default 5,
  likes       integer default 0,
  "likedBy"   text[] default '{}',
  "createdAt" timestamptz default now()
);

-- ══════════════════════════════════════════════
-- 9. conversations  (authenticated users only)
-- ══════════════════════════════════════════════
create table if not exists public.conversations (
  id              text primary key,
  participants    text[] not null,
  "merchantId"    text,
  "customerId"    text,
  "customerLabel" text,
  "isGuest"       boolean default false,
  "lastMessage"   text,
  "unreadByAdmin" boolean default false,
  "createdAt"     timestamptz default now(),
  "updatedAt"     timestamptz default now()
);

-- ══════════════════════════════════════════════
-- 10. messages
-- ══════════════════════════════════════════════
create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  "conversationId" text references public.conversations(id) on delete cascade,
  text             text,
  "senderId"       text,
  "senderEmail"    text,
  "createdAt"      timestamptz default now()
);

-- ══════════════════════════════════════════════
-- 11. owner_chats & 12. owner_chat_messages
-- ══════════════════════════════════════════════
create table if not exists public.owner_chats (
  id              uuid primary key,
  "lastMessage"   text,
  "updatedAt"     timestamptz default now(),
  "unreadByAdmin" boolean default false,
  "userEmail"     text,
  "userId"        uuid
);

create table if not exists public.owner_chat_messages (
  id            uuid primary key default gen_random_uuid(),
  "threadId"    uuid,
  text          text,
  "senderId"    uuid,
  "senderEmail" text,
  "createdAt"   timestamptz default now()
);

-- ══════════════════════════════════════════════
-- 13. config
-- ══════════════════════════════════════════════
create table if not exists public.config (
  id           text primary key,
  gold         integer,
  silver       integer,
  blue         integer,
  "specialIds" jsonb default '[]'
);
insert into public.config (id, gold, silver, blue)
values ('vip_pricing', 600, 200, 99) on conflict (id) do nothing;

-- ══════════════════════════════════════════════
-- Enable RLS
-- ══════════════════════════════════════════════
alter table public.users               enable row level security;
alter table public.products            enable row level security;
alter table public.conversations       enable row level security;
alter table public.messages            enable row level security;
alter table public.stories             enable row level security;
alter table public.comments            enable row level security;
alter table public.owner_chats         enable row level security;
alter table public.owner_chat_messages enable row level security;
alter table public.config              enable row level security;
alter table public.verifications       enable row level security;
alter table public.temp_resets         enable row level security;
alter table public.temp_resets_phone   enable row level security;
alter table public.temp_verifications  enable row level security;

-- ══════════════════════════════════════════════
-- USERS — admin override + self + public merchant read
-- ══════════════════════════════════════════════
create policy "users_admin_all"        on public.users for all
  using (public.is_admin()) with check (public.is_admin());
create policy "users_select_own"       on public.users for select using (auth.uid() = id);
create policy "users_insert_self"      on public.users for insert with check (auth.uid() = id);
create policy "users_update_own"       on public.users for update using (auth.uid() = id);
create policy "users_read_merchants"   on public.users for select using (role = 'merchant');

-- ══════════════════════════════════════════════
-- VERIFICATIONS — own row only + admin
-- ══════════════════════════════════════════════
create policy "verif_admin_all" on public.verifications for all
  using (public.is_admin()) with check (public.is_admin());
create policy "verif_own"       on public.verifications for all using (auth.uid() = id);

-- ══════════════════════════════════════════════
-- OTP TEMP TABLES — no direct client access
-- All reads/writes go through server actions with SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS. The policies below deny all anon/user key access.
-- ══════════════════════════════════════════════
create policy "temp_resets_deny_all"    on public.temp_resets       for all using (false);
create policy "temp_resets_ph_deny_all" on public.temp_resets_phone for all using (false);
create policy "temp_verif_deny_all"     on public.temp_verifications for all using (false);

-- ══════════════════════════════════════════════
-- PRODUCTS — public read; seller/admin write
-- ══════════════════════════════════════════════
create policy "products_select_all"   on public.products for select using (true);
create policy "products_admin_all"    on public.products for all
  using (public.is_admin()) with check (public.is_admin());
create policy "products_insert_owner" on public.products for insert
  with check (auth.uid() = "sellerId");
create policy "products_update_owner" on public.products for update
  using (auth.uid() = "sellerId");
create policy "products_delete_owner" on public.products for delete
  using (auth.uid() = "sellerId");

-- ══════════════════════════════════════════════
-- STORIES — public read; seller/admin write
-- ══════════════════════════════════════════════
create policy "stories_select_all"   on public.stories for select using (true);
create policy "stories_admin_all"    on public.stories for all
  using (public.is_admin()) with check (public.is_admin());
create policy "stories_insert_owner" on public.stories for insert with check (auth.uid() = "sellerId");
create policy "stories_delete_owner" on public.stories for delete using (auth.uid() = "sellerId");

-- ══════════════════════════════════════════════
-- COMMENTS — public read; authenticated write; admin full
-- ══════════════════════════════════════════════
create policy "comments_select_all"  on public.comments for select using (true);
create policy "comments_admin_all"   on public.comments for all
  using (public.is_admin()) with check (public.is_admin());
create policy "comments_insert_all" on public.comments for insert
  with check (true);  -- guests allowed; identity stored in userId/userName columns
create policy "comments_update_own"  on public.comments for update
  using (auth.uid()::text = "userId");

-- ══════════════════════════════════════════════
-- CONVERSATIONS — authenticated participants only
-- participants[] stores uuid strings matching auth.uid()
-- ══════════════════════════════════════════════
create policy "convs_admin_all"           on public.conversations for all
  using (public.is_admin()) with check (public.is_admin());
create policy "convs_select_participant"  on public.conversations for select
  using (auth.uid()::text = any(participants));
create policy "convs_insert_participant"  on public.conversations for insert
  with check (auth.uid()::text = any(participants));
create policy "convs_update_participant"  on public.conversations for update
  using (auth.uid()::text = any(participants));

-- ══════════════════════════════════════════════
-- MESSAGES — authenticated participant read/send
-- ══════════════════════════════════════════════
create policy "msgs_admin_all"            on public.messages for all
  using (public.is_admin()) with check (public.is_admin());
create policy "msgs_select_participant"   on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = "conversationId"
        and auth.uid()::text = any(c.participants)
    )
  );
create policy "msgs_insert_participant"   on public.messages for insert
  with check (
    auth.uid() is not null and
    "senderId" = auth.uid()::text and
    exists (
      select 1 from public.conversations c
      where c.id = "conversationId"
        and auth.uid()::text = any(c.participants)
    )
  );

-- ══════════════════════════════════════════════
-- OWNER CHATS — thread owner + admin
-- ══════════════════════════════════════════════
create policy "owner_chats_admin_all"         on public.owner_chats for all
  using (public.is_admin()) with check (public.is_admin());
create policy "owner_chats_own"               on public.owner_chats for all
  using (auth.uid() = id or auth.uid() = "userId");

create policy "owner_chat_msgs_admin_all"     on public.owner_chat_messages for all
  using (public.is_admin()) with check (public.is_admin());
create policy "owner_chat_msgs_own"           on public.owner_chat_messages for all
  using (auth.uid() = "senderId" or auth.uid() = "threadId");

-- ══════════════════════════════════════════════
-- CONFIG — public read; admin write
-- ══════════════════════════════════════════════
create policy "config_select_all"  on public.config for select using (true);
create policy "config_admin_write" on public.config for all
  using (public.is_admin()) with check (public.is_admin());

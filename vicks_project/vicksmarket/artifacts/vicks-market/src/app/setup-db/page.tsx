"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, Database } from "lucide-react";

const SQL = `-- ═══════════════════════════════════════════════════
--  VICKS MARKET — إعداد قاعدة البيانات
-- ═══════════════════════════════════════════════════

create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text, shop_name text, photo_url text,
  is_verified      boolean default false, verification_type text default 'blue',
  unique_id        text unique, phone text, location text,
  rating           numeric default 5.0, telegram text,
  role             text default 'customer', is_online boolean default false,
  created_at       timestamptz default now()
);

create table if not exists public.products (
  id text primary key, mall text not null, name text not null,
  price numeric not null, category text, description text, image text,
  seller text, seller_id text, seller_image text, is_online boolean default false,
  phone text, telegram text, likes int default 0, comments int default 0,
  rating numeric default 5, is_verified boolean default false, is_gold boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.stories (
  id text primary key, seller_id text, seller_name text, seller text,
  seller_image text, image text, is_gold boolean default false,
  phone text, telegram text, expires_at timestamptz, created_at timestamptz default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  product_id text references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  user_name text default 'زائر', content text not null,
  rating int default 5, created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete cascade,
  receiver_id uuid references auth.users(id) on delete cascade,
  content text not null, read boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles  enable row level security;
alter table public.products  enable row level security;
alter table public.stories   enable row level security;
alter table public.comments  enable row level security;
alter table public.messages  enable row level security;

create policy if not exists "public read products" on public.products for select using (true);
create policy if not exists "public read stories"  on public.stories  for select using (true);
create policy if not exists "public read comments" on public.comments for select using (true);
create policy if not exists "public read profiles" on public.profiles for select using (true);
create policy if not exists "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy if not exists "anyone insert comment" on public.comments for insert with check (true);
create policy if not exists "users see own messages" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy if not exists "users send messages" on public.messages for insert with check (auth.uid() = sender_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, shop_name, photo_url, phone, location, role, unique_id, is_verified)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'shopName',
    new.raw_user_meta_data->>'photoURL', new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'location', coalesce(new.raw_user_meta_data->>'role','customer'),
    new.raw_user_meta_data->>'unique_id', (new.raw_user_meta_data->>'isVerified')::boolean)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();`;

export default function SetupDbPage() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "").replace(".supabase.co", "");

  return (
    <div className="min-h-screen bg-[#1A2332] text-white p-4 font-cairo" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-4 pt-8">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg">إعداد قاعدة البيانات</h1>
            <p className="text-slate-400 text-xs">انسخ الكود وشغّله في Supabase SQL Editor</p>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-slate-800 rounded-2xl p-4 space-y-3 text-sm">
          <p className="font-black text-orange-400 text-xs uppercase tracking-widest">الخطوات</p>
          <div className="space-y-2 text-slate-300 text-xs font-bold">
            <p>١. اضغط "نسخ الكود" أدناه</p>
            <p>٢. افتح Supabase → SQL Editor</p>
            <p>٣. الصق الكود واضغط Run</p>
          </div>
          <a
            href={`https://supabase.com/dashboard/project/${supabaseUrl}/sql/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-black text-sm w-full justify-center active:scale-95 transition-transform"
          >
            <ExternalLink className="w-4 h-4" />
            افتح SQL Editor
          </a>
        </div>

        {/* SQL Code */}
        <div className="relative">
          <button
            onClick={copy}
            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-black active:scale-95 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "تم النسخ!" : "نسخ الكود"}
          </button>
          <pre className="bg-slate-900 rounded-2xl p-4 pt-12 text-[10px] text-slate-300 overflow-x-auto leading-relaxed border border-slate-700 max-h-96 overflow-y-auto text-left" dir="ltr">
            {SQL}
          </pre>
        </div>

        {/* Tables list */}
        <div className="grid grid-cols-2 gap-2">
          {["profiles", "products", "stories", "comments", "messages"].map(t => (
            <div key={t} className="bg-slate-800 rounded-xl px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="text-xs font-black text-slate-300">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

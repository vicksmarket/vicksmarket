-- ═══════════════════════════════════════════════════════════════
--  Migration 003: Chat tables – conversations, messages,
--                 owner_chats, owner_chat_messages
--
--  Run this in Supabase SQL Editor if your database was created
--  from schema.sql (which had an older messages structure).
--  Safe to re-run (uses CREATE TABLE IF NOT EXISTS + DROP POLICY
--  IF EXISTS before re-creating policies).
-- ═══════════════════════════════════════════════════════════════

-- ── Helper (idempotent) ──────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select auth.email() in (
    'vicksmarket@gmail.com',
    'mom1113694362@gmail.com',
    'mom01113694362@icloud.com'
  );
$$;

-- ── 1. Drop old messages table if it has the wrong schema ────────
-- (The old schema.sql used sender_id/receiver_id/content instead
--  of conversationId/text/senderId which the app actually uses.)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'messages'
      and column_name  = 'sender_id'
  ) then
    drop table if exists public.messages cascade;
  end if;
end $$;

-- ── 2. conversations ─────────────────────────────────────────────
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

-- ── 3. messages ──────────────────────────────────────────────────
create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  "conversationId" text references public.conversations(id) on delete cascade,
  text             text,
  "senderId"       text,
  "senderEmail"    text,
  "createdAt"      timestamptz default now()
);

-- ── 4. owner_chats ───────────────────────────────────────────────
create table if not exists public.owner_chats (
  id              uuid primary key,
  "lastMessage"   text,
  "updatedAt"     timestamptz default now(),
  "unreadByAdmin" boolean default false,
  "userEmail"     text,
  "userId"        uuid
);

-- ── 5. owner_chat_messages ───────────────────────────────────────
create table if not exists public.owner_chat_messages (
  id            uuid primary key default gen_random_uuid(),
  "threadId"    uuid,
  text          text,
  "senderId"    uuid,
  "senderEmail" text,
  "createdAt"   timestamptz default now()
);

-- ── 6. Enable RLS ────────────────────────────────────────────────
alter table public.conversations       enable row level security;
alter table public.messages            enable row level security;
alter table public.owner_chats         enable row level security;
alter table public.owner_chat_messages enable row level security;

-- ── 7. RLS policies: conversations ───────────────────────────────
drop policy if exists "convs_admin_all"          on public.conversations;
drop policy if exists "convs_select_participant" on public.conversations;
drop policy if exists "convs_insert_participant" on public.conversations;
drop policy if exists "convs_update_participant" on public.conversations;

create policy "convs_admin_all"
  on public.conversations for all
  using (public.is_admin()) with check (public.is_admin());

create policy "convs_select_participant"
  on public.conversations for select
  using (auth.uid()::text = any(participants));

create policy "convs_insert_participant"
  on public.conversations for insert
  with check (auth.uid()::text = any(participants));

create policy "convs_update_participant"
  on public.conversations for update
  using (auth.uid()::text = any(participants));

-- ── 8. RLS policies: messages ────────────────────────────────────
drop policy if exists "msgs_admin_all"           on public.messages;
drop policy if exists "msgs_select_participant"  on public.messages;
drop policy if exists "msgs_insert_participant"  on public.messages;
-- clean up old schema.sql policies if they exist
drop policy if exists "users see own messages"   on public.messages;
drop policy if exists "users send messages"      on public.messages;

create policy "msgs_admin_all"
  on public.messages for all
  using (public.is_admin()) with check (public.is_admin());

create policy "msgs_select_participant"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = "conversationId"
        and auth.uid()::text = any(c.participants)
    )
  );

create policy "msgs_insert_participant"
  on public.messages for insert
  with check (
    auth.uid() is not null
    and "senderId" = auth.uid()::text
    and exists (
      select 1 from public.conversations c
      where c.id = "conversationId"
        and auth.uid()::text = any(c.participants)
    )
  );

-- ── 9. RLS policies: owner_chats ─────────────────────────────────
drop policy if exists "owner_chats_admin_all" on public.owner_chats;
drop policy if exists "owner_chats_own"       on public.owner_chats;

create policy "owner_chats_admin_all"
  on public.owner_chats for all
  using (public.is_admin()) with check (public.is_admin());

create policy "owner_chats_own"
  on public.owner_chats for all
  using (auth.uid() = id or auth.uid() = "userId");

-- ── 10. RLS policies: owner_chat_messages ────────────────────────
drop policy if exists "owner_chat_msgs_admin_all" on public.owner_chat_messages;
drop policy if exists "owner_chat_msgs_own"       on public.owner_chat_messages;

create policy "owner_chat_msgs_admin_all"
  on public.owner_chat_messages for all
  using (public.is_admin()) with check (public.is_admin());

create policy "owner_chat_msgs_own"
  on public.owner_chat_messages for all
  using (auth.uid() = "senderId" or auth.uid() = "threadId");

-- ── 11. Enable Realtime ──────────────────────────────────────────
-- Supabase Realtime: add tables to the supabase_realtime publication
-- so that INSERT/UPDATE/DELETE events are broadcast to subscribers.
do $$
begin
  -- conversations
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;

  -- messages
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  -- owner_chats
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'owner_chats'
  ) then
    alter publication supabase_realtime add table public.owner_chats;
  end if;

  -- owner_chat_messages
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'owner_chat_messages'
  ) then
    alter publication supabase_realtime add table public.owner_chat_messages;
  end if;
end $$;

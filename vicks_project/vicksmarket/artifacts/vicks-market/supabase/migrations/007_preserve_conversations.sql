-- ═══════════════════════════════════════════════════════════════
--  Migration 007: Preserve conversations after product deletion
--
--  Changes:
--  1. Drop ON DELETE CASCADE on messages.conversationId and replace
--     with ON DELETE SET NULL so messages survive conversation archival.
--  2. Add `archived_at` timestamptz column to conversations so rows
--     are soft-deleted instead of hard-deleted.
--
--  Safe to re-run (all steps are idempotent).
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Add archived_at to conversations (idempotent) ─────────────
alter table public.conversations
  add column if not exists "archivedAt" timestamptz default null;

-- ── 2. Change messages FK from CASCADE to SET NULL ───────────────
-- PostgreSQL does not support ALTER CONSTRAINT directly for FK options,
-- so we drop the existing FK and recreate it with the new policy.

-- Find and drop the existing FK constraint on messages.conversationId
do $$
declare
  v_constraint text;
begin
  select conname into v_constraint
  from pg_constraint
  where conrelid = 'public.messages'::regclass
    and contype  = 'f'
    and conkey   = array(
          select attnum from pg_attribute
          where attrelid = 'public.messages'::regclass
            and attname  = 'conversationId'
        );

  if v_constraint is not null then
    execute format('alter table public.messages drop constraint %I', v_constraint);
  end if;
end $$;

-- Recreate the FK with SET NULL so orphaned messages are kept
alter table public.messages
  add constraint messages_conversation_id_fkey
  foreign key ("conversationId")
  references public.conversations(id)
  on delete set null;

-- ── 3. Update RLS: admins can still read archived conversations ───
-- (existing policies already allow admin full access via is_admin(),
--  no extra policy needed for archived rows)

-- ── 4. Ensure active conversations filter excludes archived ones ──
-- Create a helper view so the app can query non-archived conversations
-- without changing every query.
create or replace view public.active_conversations as
  select * from public.conversations
  where "archivedAt" is null;

-- Grant SELECT on the view to authenticated users
grant select on public.active_conversations to authenticated;

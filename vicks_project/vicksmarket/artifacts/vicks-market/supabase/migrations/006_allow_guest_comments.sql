-- Migration 006: Allow guest (unauthenticated) users to post comments
-- The frontend already handles guest identity (guest-<timestamp> uid, "زائر XXXX" name).
-- Drop the old authenticated-only insert policy and replace with an open one.

drop policy if exists "comments_insert_auth" on public.comments;

create policy "comments_insert_all" on public.comments for insert
  with check (true);

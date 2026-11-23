-- Migration: short-lived reset tokens issued after successful OTP verification.
-- Used so password reset can complete without an active Supabase session.

create table if not exists public.temp_reset_tokens (
  id          text primary key,   -- random token (UUID-like)
  email       text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz default now()
);

alter table public.temp_reset_tokens enable row level security;

-- Only service role (bypasses RLS) may read/write
create policy "temp_reset_tokens_deny_all"
  on public.temp_reset_tokens
  for all
  using (false);

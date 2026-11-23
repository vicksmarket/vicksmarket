-- Migration: add temp_verifications_email table for secure server-side email OTP on signup
-- (analogous to temp_verifications for phone, but keyed by email address)

create table if not exists public.temp_verifications_email (
  id          text primary key,   -- email address (lowercased)
  code        text,
  "expiresAt" timestamptz,
  "createdAt" timestamptz default now()
);

alter table public.temp_verifications_email enable row level security;

-- Deny all public access — only service role (bypasses RLS) may read/write
create policy "temp_verif_email_deny_all"
  on public.temp_verifications_email
  for all
  using (false);

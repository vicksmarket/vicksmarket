---
name: Firebase → Supabase migration
description: Durable lessons from the Firebase→Supabase migration in vicks-market
---

## Admin RLS pattern
Admin cross-user mutations (ban/verify/points) require a `is_admin()` helper function that checks `auth.email()` and is used in RLS policies alongside user-scoped policies. Without this, admin operations silently fail because user-scoped policies only allow self-update.

**Why:** Supabase RLS is checked on every query including admin mutations from browser clients. Service-role bypass is only possible server-side.

**How to apply:** Create `public.is_admin()` as a `security definer` function; attach `for all using (public.is_admin())` policies alongside regular user policies on sensitive tables.

## Server client is async
`createClient()` from `@/utils/supabase/server` is async (awaits `cookies()`). Must always be `await`ed before calling `.from(...)`.

**Why:** Next.js `cookies()` is async in App Router. Forgetting `await` returns a Promise, and `.from(...)` on a Promise silently fails.

## Realtime via polling
Supabase Realtime WebSockets were replaced with `setInterval` polling in `useRealtimeCollection`. Default poll interval: 3-5 seconds.

**Why:** Supabase Realtime requires additional setup and has connection limits. Polling is simpler and sufficient for chat features at this scale.

## Guest chat support
Chat and comments tables need `insert` policies that allow unauthenticated/guest writes (guest IDs stored as `guest-{timestamp}`), since the app explicitly supports anonymous browsing and chatting.

## Temp OTP tables
`temp_resets`, `temp_resets_phone`, `temp_verifications` tables must have open RLS (no auth check) because they're written before authentication completes. Security comes from code value matching + expiry checks in app code, not from auth identity.

"use client";

// Re-export all hooks from the canonical supabase-hooks module.
// This file exists for backward-compatibility with any imports that reference @/lib/hooks.
export {
  useUser,
  useSupabase,
  useDoc,
  useCollection,
  useRealtimeCollection,
} from "@/lib/supabase-hooks";
export type { VicksUser, QueryFilter } from "@/lib/supabase-hooks";

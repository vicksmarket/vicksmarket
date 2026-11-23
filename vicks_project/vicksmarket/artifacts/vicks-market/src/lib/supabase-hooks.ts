'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

// Firebase-compatible user wrapper
export interface VicksUser {
  uid: string;
  id: string;
  email: string | undefined;
  emailVerified: boolean;
  displayName: string | null;
}

function toVicksUser(user: User): VicksUser {
  return {
    uid: user.id,
    id: user.id,
    email: user.email,
    emailVerified: !!user.email_confirmed_at,
    displayName: user.user_metadata?.full_name || null,
  };
}

export function useUser() {
  const [user, setUser] = useState<VicksUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }

    // Safety timeout: never stay loading more than 3s
    const timeout = setTimeout(() => setLoading(false), 3000);

    // onAuthStateChange fires immediately (INITIAL_SESSION) with the current
    // session — no need for a separate getSession() call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toVicksUser(session.user) : null);
      setLoading(false);
      clearTimeout(timeout);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export function useSupabase() {
  return createClient();
}

// Fetch a single row by id from a Supabase table
export function useDoc<T = any>(tableName: string | null, id: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tableName || !id) {
      setData(null);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }
    supabase.from(tableName).select('*').eq('id', id).maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(error as any);
        else setData(data);
        setLoading(false);
      });
  }, [tableName, id]);

  return { data, loading, error };
}

export interface QueryFilter {
  column: string;
  value: any;
  /** Supported operators:
   *  eq (default), neq, gt, gte, lt, lte, contains (array), is (for IS NULL / IS NOT NULL)
   */
  op?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'is';
}

function applyFilters(q: any, filters: QueryFilter[]): any {
  for (const f of filters) {
    switch (f.op) {
      case 'gt':       q = q.gt(f.column, f.value); break;
      case 'gte':      q = q.gte(f.column, f.value); break;
      case 'lt':       q = q.lt(f.column, f.value); break;
      case 'lte':      q = q.lte(f.column, f.value); break;
      case 'neq':      q = q.neq(f.column, f.value); break;
      case 'contains': q = q.contains(f.column, [f.value]); break;
      case 'is':
        // PostgREST `is` filter for IS NULL / IS NOT NULL
        q = q.is(f.column, f.value); break;
      default:         q = q.eq(f.column, f.value); break;
    }
  }
  return q;
}

export function useCollection<T = any>(
  tableName: string | null,
  filters?: QueryFilter[],
  options?: { orderBy?: string; orderAsc?: boolean; limit?: number }
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const filtersKey = JSON.stringify(filters);
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    if (!tableName) {
      setData(null);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }
    let q: any = supabase.from(tableName).select('*');

    if (filters) q = applyFilters(q, filters);
    if (options?.orderBy) q = q.order(options.orderBy, { ascending: options?.orderAsc ?? false });
    if (options?.limit) q = q.limit(options.limit);

    q.then(({ data, error }: { data: T[] | null; error: any }) => {
      if (error) setError(error);
      else setData(data || []);
      setLoading(false);
    });
  }, [tableName, filtersKey, optionsKey]);

  return { data, loading, error };
}

// Polling-based realtime hook (poll every N ms)
export function useRealtimeCollection<T = any>(
  tableName: string | null,
  filters?: QueryFilter[],
  options?: { orderBy?: string; orderAsc?: boolean; limit?: number; pollMs?: number }
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  const filtersKey = JSON.stringify(filters);
  const optionsKey = JSON.stringify(options);
  const pollMs = options?.pollMs ?? 3000;

  useEffect(() => {
    if (!tableName) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const supabase = createClient();
      if (!supabase) { setLoading(false); return; }
      let q: any = supabase.from(tableName).select('*');
      if (filters) q = applyFilters(q, filters);
      if (options?.orderBy) q = q.order(options.orderBy, { ascending: options?.orderAsc ?? true });
      if (options?.limit) q = q.limit(options.limit);

      const { data, error } = await q;
      if (!error) setData(data || []);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, pollMs);
    return () => clearInterval(interval);
  }, [tableName, filtersKey, optionsKey, pollMs]);

  return { data, loading };
}

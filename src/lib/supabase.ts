import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(url?: string): string {
  const fallback = 'https://ksnvpnvpajhujmwutumh.supabase.co';
  if (!url || typeof url !== 'string') return fallback;
  let clean = url.trim();
  // Remove /rest/v1 or any subpath if passed accidentally in env var
  clean = clean.replace(/\/rest\/v1\/?$/i, '');
  clean = clean.replace(/\/+$/, '');
  return clean || fallback;
}

const rawUrl =
  typeof import.meta !== 'undefined'
    ? (import.meta as any).env?.VITE_SUPABASE_URL
    : undefined;

export const SUPABASE_URL = normalizeSupabaseUrl(rawUrl);

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY?.trim()) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbnZwbnZwYWpodWptd3V0dW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxOTczMjAsImV4cCI6MjEwMzc3MzMyMH0.hcY0_V8vmHgKxhUiuPC0UHecJaApzCZHGdyRbrYywNw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});



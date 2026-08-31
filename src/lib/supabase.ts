import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  'https://ksnvpnvpajhujmwutumh.supabase.co';

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbnZwbnZwYWpodWptd3V0dW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxOTczMjAsImV4cCI6MjEwMzc3MzMyMH0.hcY0_V8vmHgKxhUiuPC0UHecJaApzCZHGdyRbrYywNw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});


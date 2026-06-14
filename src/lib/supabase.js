// Dear Me — Supabase Client Singleton
// Reads credentials from environment variables (VITE_ prefix for Vite)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create the client if credentials are configured
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,   // no auth sessions for anon access
      autoRefreshToken: false,
    },
  });
}

/**
 * Check if Supabase is configured and available.
 * When false, the app runs in localStorage-only mode.
 */
export function isSupabaseConfigured() {
  return supabase !== null;
}

export default supabase;

/**
 * Single shared Readdy Backend (Supabase-compatible) client.
 * Creating more than one instance breaks auth session syncing, so every
 * feature in the app must import this module instead of calling createClient.
 */
import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_PUBLIC_SUPABASE_URL as string | undefined) ?? '';
const anonKey = (import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ?? '';

export const isBackendConfigured = Boolean(url && anonKey);

export const supabase = createClient(
  isBackendConfigured ? url : 'https://placeholder.supabase.co',
  isBackendConfigured ? anonKey : 'public-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
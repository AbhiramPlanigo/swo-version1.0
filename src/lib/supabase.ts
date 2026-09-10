import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

if (!isSupabaseConfigured) {
  console.info(
    '[SWO Portal] Supabase is currently not configured or credentials are empty. Running with resilient local caching. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to connect to live Supabase database.'
  );
} else {
  console.info('[SWO Portal] Successfully initialized Supabase client with endpoint:', supabaseUrl);
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,   // nós tratamos a URL manualmente no /auth/reset
      flowType: 'pkce',            // <<< usa ?code=..., mais resistente a scanners
      storageKey: 'sb-auth-rosilias-v1',
      // Se ainda ver erro de Lock, pode “burlar” o lock:
      // lock: async (_name, acquire) => await acquire(),
    }
  }
);

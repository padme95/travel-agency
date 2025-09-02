import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.prod';

export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'sb-auth-rosilias-v1',
      lock: async (_n: string, _t: number, exec: () => Promise<any>) => await exec(),
    },
  }
);

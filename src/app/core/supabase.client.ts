import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'sb-auth-rosilias-v1',
      // Lock “no-op”: ignora o lock do navegador e apenas executa
      lock: async (_name: string, _acquireTimeout: number, execute: () => Promise<any>) => {
        return await execute();
      },
    },
  }
);

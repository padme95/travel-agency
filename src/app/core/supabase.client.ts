import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.prod';

export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey
);

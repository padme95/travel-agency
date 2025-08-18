export const environment = {
  production: true,
  supabaseUrl: (import.meta as any).env['NG_APP_SUPABASE_URL'] ?? '',
  supabaseAnonKey: (import.meta as any).env['NG_APP_SUPABASE_ANON_KEY'] ?? '',
  stripePublishableKey: (import.meta as any).env['NG_APP_STRIPE_KEY'] ?? ''
};


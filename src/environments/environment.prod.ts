export const environment = {
  production: false,
  supabaseUrl: (window as any)['env']['NG_APP_SUPABASE_URL'] || '',
  supabaseAnonKey: (window as any)['env']['NG_APP_SUPABASE_ANON_KEY'] || '',
  stripePublishableKey: (window as any)['env']?.['NG_APP_STRIPE_PUBLISHABLE_KEY'] || '',
};

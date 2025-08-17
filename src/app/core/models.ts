export type Package = {
  id: number;
  slug: string;
  title: string;
  description?: string;
  image_url?: string;
  price_cents: number;
  active: boolean;
};

export type CartItem = { pkg: Package; qty: number };

export type Order = {
  id?: number;
  user_id?: string;
  status?: 'pending'|'paid'|'canceled';
  total_cents: number;
  currency: 'BRL';
  stripe_payment_intent_id?: string;
};

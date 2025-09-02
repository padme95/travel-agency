import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const SECRET = process.env.STRIPE_SECRET_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!SECRET || !SECRET.startsWith('sk_')) {
    return res.status(500).json({
      error: 'Server misconfigured: STRIPE_SECRET_KEY deve começar com sk_',
      hint: { hasVar: !!SECRET, prefix: SECRET ? SECRET.slice(0,3) : 'none' }
    });
  }

  const stripe = new Stripe(SECRET, { apiVersion: '2024-06-20' as Stripe.LatestApiVersion });

  try {
    const { orderId, amount_cents, currency = 'BRL' } = req.body || {};
    if (!orderId || !amount_cents) {
      return res.status(400).json({ error: 'orderId e amount_cents são obrigatórios' });
    }

    const intent = await stripe.paymentIntents.create({
      amount: amount_cents,
      currency,
      automatic_payment_methods: { enabled: true }, // cartão + pix/brl
      metadata: { order_id: String(orderId) },
    });

    return res.status(200).json({ clientSecret: intent.client_secret });
  } catch (e: any) {
    console.error('create-payment-intent error:', e);
    return res.status(500).json({ error: e?.message || 'stripe error' });
  }
}

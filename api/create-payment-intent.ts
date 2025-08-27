import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-07-30.basil'
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { orderId, amount_cents, currency = 'BRL' } = req.body || {};
    if (!orderId || !amount_cents) return res.status(400).json({ error: 'orderId e amount_cents são obrigatórios' });

    const intent = await stripe.paymentIntents.create({
      amount: amount_cents,
      currency,
      automatic_payment_methods: { enabled: true }, // cartão + pix
      metadata: { order_id: String(orderId) }
    });

    return res.status(200).json({ clientSecret: intent.client_secret });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || 'stripe error' });
  }
}

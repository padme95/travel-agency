// api/stripe-webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || '';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || '';

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: '2024-06-20' as Stripe.LatestApiVersion });
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
  : null;

function buffer(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  if (!STRIPE_SECRET.startsWith('sk_')) return res.status(500).send('Server misconfigured: STRIPE_SECRET_KEY inválida');
  if (!WEBHOOK_SECRET) return res.status(500).send('Server misconfigured: STRIPE_WEBHOOK_SECRET ausente');
  if (!supabase) return res.status(500).send('Server misconfigured: SUPABASE_URL / SUPABASE_SERVICE_ROLE ausentes');

  const sig = req.headers['stripe-signature'] as string;
  const buf = await buffer(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature failed:', err?.message || err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const updateOrder = async (orderIdStr: string | null | undefined, fields: Record<string, any>) => {
      if (!orderIdStr) return;
      const orderId = Number(orderIdStr);
      if (!Number.isFinite(orderId)) {
        console.warn('order_id inválido no metadata:', orderIdStr);
        return;
      }
      const { error } = await supabase.from('orders').update(fields).eq('id', orderId);
      if (error) console.error('Erro ao atualizar order:', error.message);
    };

    switch (event.type) {
      case 'payment_intent.processing': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await updateOrder(pi.metadata?.order_id, { status: 'processing', stripe_pi_id: pi.id });
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await updateOrder(pi.metadata?.order_id, { status: 'paid', stripe_pi_id: pi.id });
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await updateOrder(pi.metadata?.order_id, { status: 'failed', stripe_pi_id: pi.id });
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (e: any) {
    console.error('Webhook handler error:', e?.message || e);
    return res.status(500).json({ error: 'webhook handler failed' });
  }
}

// // api/webhook.ts
// import type { VercelRequest, VercelResponse } from '@vercel/node';
// import Stripe from 'stripe';
// import { createClient } from '@supabase/supabase-js';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
// const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// export default async function handler(req: VercelRequest, res: VercelResponse) {
//   const sig = req.headers['stripe-signature'] as string;
//   let event: Stripe.Event;

//   try {
//     const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
//     event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
//   } catch (err: any) {
//     console.error('Webhook signature verification failed.', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   try {
//     if (event.type === 'payment_intent.succeeded') {
//       const pi = event.data.object as Stripe.PaymentIntent;
//       const orderId = Number(pi.metadata?.order_id);
//       if (orderId) {
//         await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);
//       }
//     }
//     return res.status(200).json({ received: true });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: 'Webhook handling failed' });
//   }
// }

// // Importante: configure a função para receber o body cru (raw) na Vercel:
// // Em vercel.json, defina "webhook" com "bodyParser": false, se necessário


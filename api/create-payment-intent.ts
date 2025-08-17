// // api/create-payment-intent.ts
// import type { VercelRequest, VercelResponse } from '@vercel/node';
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });

// export default async function handler(req: VercelRequest, res: VercelResponse) {
//   try {
//     if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

//     const { amount_cents, currency = 'BRL', metadata } = req.body;
//     if (!amount_cents || amount_cents <= 0) return res.status(400).json({ error: 'Invalid amount' });

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount_cents,
//       currency,
//       automatic_payment_methods: { enabled: true }, // cartão etc (modo de testes)
//       metadata: metadata ?? {},
//     });

//     return res.status(200).json({ clientSecret: paymentIntent.client_secret });
//   } catch (err: any) {
//     console.error(err);
//     return res.status(500).json({ error: 'Internal error' });
//   }
// }

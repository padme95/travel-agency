// src/app/features/checkout/checkout.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe as StripeJs, StripeElements } from '@stripe/stripe-js';
import { supabase } from '../../core/supabase.client';
import { CartService } from '../../core/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule],
  template: `
  <div class="container py-3">
    <h2 class="h4 mb-3">Pagamento</h2>

    <div *ngIf="msg" class="alert" [class.alert-success]="ok" [class.alert-danger]="!ok">{{ msg }}</div>

    <div *ngIf="!clientSecret">Calculando…</div>
    <form *ngIf="clientSecret" (submit)="pay($event)">
      <div id="payment-element" class="mb-3"></div>
      <button class="btn btn-primary" [disabled]="loading || !elements">Pagar {{ totalBRL }}</button>
    </form>
  </div>
  `
})
export class CheckoutComponent implements OnInit {
  private cart = inject(CartService);

  stripe: StripeJs | null = null;
  elements: StripeElements | null = null;
  clientSecret = '';
  orderId?: number;

  loading = false;
  ok = false;
  msg = '';

  get totalCents() { return this.cart.totalCents(); }
  get totalBRL() { return (this.totalCents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

  async ngOnInit() {
    // 1) publishable key
    const pk = environment.stripePublishableKey;
    if (!pk) { this.msg = 'Config ausente: stripePublishableKey'; return; }

    this.stripe = await loadStripe(pk);
    if (!this.stripe) { this.msg = 'Falha ao iniciar Stripe.'; return; }

    // 2) cria ordem pendente
    const user = (await supabase.auth.getUser()).data.user;
    const { data: order, error: orderErr } = await supabase.from('orders').insert({
      user_id: user?.id ?? null,
      total_cents: this.totalCents,
      currency: 'BRL',
      status: 'pending'
    }).select('*').single();
    if (orderErr) { this.msg = orderErr.message; return; }
    this.orderId = order.id;

    // 3) chama API (usa domínio do Vercel em dev, relativo em prod)
    const API_BASE = location.hostname === 'localhost'
      ? 'https://SEU-PROJETO.vercel.app'  // << troque para o domínio do seu projeto no Vercel
      : '';

    const resp = await fetch(`${API_BASE}/api/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ orderId: this.orderId, amount_cents: this.totalCents, currency: 'BRL' })
    });

    if (!resp.ok) {
      const txt = await resp.text();
      this.msg = `Erro na API (${resp.status}): ${txt?.slice(0,120)}`;
      return;
    }

    const json = await resp.json();
    this.clientSecret = json.clientSecret;

    // 4) monta Payment Element
    this.elements = this.stripe.elements({ clientSecret: this.clientSecret, appearance: { theme: 'stripe' } });
    const paymentElement = this.elements.create('payment');
    paymentElement.mount('#payment-element');
  }

  async pay(ev: Event) {
    ev.preventDefault();
    if (!this.stripe || !this.elements) return;

    this.loading = true; this.msg = ''; this.ok = false;

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: { return_url: window.location.origin + '/checkout' }
    });

    if (error) {
      this.msg = error.message || 'Pagamento não concluído.';
      this.loading = false;
      return;
    }

    this.ok = true;
    this.msg = 'Pagamento enviado! Assim que for confirmado, seu pedido será marcado como pago.';
    this.cart.clear();
    this.loading = false;
  }
}

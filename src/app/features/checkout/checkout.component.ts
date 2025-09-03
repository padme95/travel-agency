import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe as StripeJs, StripeElements, PaymentIntentResult } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment.prod';
import { supabase } from '../../core/supabase.client';
import { CartService } from '../../core/cart.service';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="container py-3">
    <h2 class="h4 mb-3">Checkout</h2>

    <div *ngIf="msg" class="alert" [class.alert-success]="ok" [class.alert-danger]="!ok">{{ msg }}</div>

    <div *ngIf="loadingInit" class="text-secondary">Preparando pagamento…</div>

    <form *ngIf="!loadingInit && clientSecret" (submit)="pay($event)">
      <div #paymentEl id="payment-element" class="mb-3"></div>

      <div class="d-flex gap-2">
        <button class="btn btn-primary" [disabled]="loading || !elements">
          <span *ngIf="!loading">Pagar {{ totalBRL }}</span>
          <span *ngIf="loading">Processando…</span>
        </button>

        <a class="btn btn-outline-secondary" routerLink="/carrinho">
          Voltar ao carrinho
        </a>
      </div>

      <p class="text-secondary small mt-2">
        Os dados são processados pela Stripe. Podemos solicitar uma verificação adicional (3D Secure) se necessário.
      </p>
    </form>
  </div>
  `
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private cart = inject(CartService);

  @ViewChild('paymentEl') paymentEl!: ElementRef<HTMLDivElement>;

  stripe: StripeJs | null = null;
  elements: StripeElements | null = null;

  clientSecret = '';
  orderId?: number;

  loadingInit = true;
  loading = false;
  ok = false;
  msg = '';

  get totalCents() { return this.cart.totalCents(); }
  get totalBRL() { return (this.totalCents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

  async ngOnInit() {
    const url = new URL(window.location.href);
    const returnedClientSecret = url.searchParams.get('payment_intent_client_secret');
    if (returnedClientSecret) {
      await this.handleReturnFlow(returnedClientSecret);
    }

    const pk = environment.stripePublishableKey;
    if (!pk) { this.failInit('Falta configurar a publishable key da Stripe.'); return; }

    this.stripe = await loadStripe(pk);
    if (!this.stripe) { this.failInit('Falha ao iniciar Stripe.js'); return; }

    try {
      const user = (await supabase.auth.getUser()).data.user;
      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user?.id ?? null,
        total_cents: this.totalCents,
        currency: 'BRL',
        status: 'pending'
      }).select('*').single();
      if (error) throw error;
      this.orderId = order.id;

      const resp = await fetch(`/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          orderId: this.orderId,
          amount_cents: this.totalCents,
          currency: 'BRL'
        })
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`API ${resp.status}: ${txt}`);
      }
      const json = await resp.json();
      this.clientSecret = json.clientSecret;

      this.loadingInit = false;
      this.cdr.detectChanges();
      await Promise.resolve();

      this.elements = this.stripe.elements({
        clientSecret: this.clientSecret,
        appearance: { theme: 'stripe' }
      });
      const paymentElement = this.elements.create('payment');
      paymentElement.mount(this.paymentEl.nativeElement);

    } catch (e: any) {
      this.failInit(e?.message || 'Não foi possível preparar o pagamento.');
    }
  }

  ngOnDestroy() {
    try { this.elements?.getElement('payment')?.unmount(); } catch {}
  }

  async pay(ev: Event) {
    ev.preventDefault();
    if (!this.stripe || !this.elements) return;

    this.loading = true; this.msg = ''; this.ok = false;

    const result: PaymentIntentResult = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: { return_url: window.location.origin + '/checkout' },
      redirect: 'if_required'
    });

    if (result.error) {
      this.msg = result.error.message || 'Pagamento não concluído.';
      this.loading = false;
      return;
    }

    const pi = result.paymentIntent;
    if (pi) {
      await this.handlePaymentIntentStatus(pi.status, pi.id);
      this.loading = false;
      return;
    }

    this.loading = false;
  }

  private async handleReturnFlow(clientSecret: string) {
    try {
      if (!this.stripe) {
        const pk = environment.stripePublishableKey;
        if (!pk) throw new Error('Stripe publishable key ausente.');
        this.stripe = await loadStripe(pk);
        if (!this.stripe) throw new Error('Falha ao iniciar Stripe.js no retorno.');
      }

      const { paymentIntent, error } = await this.stripe.retrievePaymentIntent(clientSecret);

      if (error) {
        this.ok = false;
        this.msg = error.message || 'Não foi possível verificar o pagamento.';
        return;
      }

      if (!paymentIntent) {
        this.ok = false;
        this.msg = 'Pagamento não localizado. Tente novamente.';
        return;
      }

      await this.handlePaymentIntentStatus(paymentIntent.status, paymentIntent.id);
    } catch (e: any) {
      this.ok = false;
      this.msg = e?.message || 'Falha ao processar retorno do pagamento.';
    }
  }

  private async handlePaymentIntentStatus(status: string, paymentIntentId?: string) {
    switch (status) {
      case 'succeeded':
        this.ok = true;
        this.msg = '✅ Pagamento concluído com sucesso!';
        this.cart.clear();
        break;

      case 'processing':
        this.ok = true;
        this.msg = '⏳ Pagamento recebido e em processamento. Você será notificado quando concluir.';
        break;

      case 'requires_payment_method':
        this.ok = false;
        this.msg = '❌ Pagamento não autorizado. Verifique os dados do cartão ou tente outro método.';
        break;

      case 'requires_action':
        this.ok = false;
        this.msg = '⚠️ É necessária uma verificação adicional. Clique em pagar novamente para continuar.';
        break;

      case 'canceled':
        this.ok = false;
        this.msg = 'Pagamento cancelado. Tente novamente.';
        break;

      default:
        this.ok = false;
        this.msg = `Status do pagamento: ${status}. Consulte o suporte se persistir.`;
    }
  }

  private failInit(message: string) {
    this.loadingInit = false;
    this.ok = false;
    this.msg = message;
  }
}

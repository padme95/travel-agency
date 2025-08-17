// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { loadStripe } from '@stripe/stripe-js';
// import { HttpClient } from '@angular/common/http';
// import { CartService } from '../../core/cart.service';
// import { supabase } from '../../core/supabase.client';

// @Component({
//   standalone: true,
//   selector: 'app-checkout',
//   imports: [CommonModule],
//   template: `
//   <h2>Checkout</h2>
//   <p>Total: {{ (totalCents/100) | currency:'BRL' }}</p>
//   <button (click)="pay()" [disabled]="loading">Pagar (teste)</button>
//   <p *ngIf="msg">{{msg}}</p>
//   `
// })
// export class CheckoutComponent implements OnInit {
//   totalCents = 0;
//   loading = false;
//   msg = '';

//   constructor(private http: HttpClient, private cart: CartService) {}

//   async ngOnInit() {
//     this.totalCents = this.cart.totalCents();
//   }

//   async pay() {
//     this.loading = true;
//     try {
//       // 1) cria pedido pending no Supabase
//       const user = (await supabase.auth.getUser()).data.user;
//       const { data: order, error: orderErr } = await supabase.from('orders')
//         .insert({ user_id: user?.id ?? null, total_cents: this.totalCents, currency: 'BRL', status: 'pending' })
//         .select('*').single();
//       if (orderErr) throw orderErr;

//       // 2) itens do pedido
//       const items = this.cart.items().map(i => ({
//         order_id: order.id,
//         package_id: i.pkg.id,
//         qty: i.qty,
//         unit_price_cents: i.pkg.price_cents
//       }));
//       const { error: itemsErr } = await supabase.from('order_items').insert(items);
//       if (itemsErr) throw itemsErr;

//       // 3) cria PaymentIntent no backend
//       const { clientSecret }: any = await this.http.post('/api/create-payment-intent', {
//         amount_cents: this.totalCents,
//         currency: 'BRL',
//         metadata: { order_id: order.id.toString() }
//       }).toPromise();

//       // 4) redireciona para método de pagamento
//       const stripe = await loadStripe((import.meta as any).env['NG_APP_STRIPE_PUBLISHABLE_KEY']);
//       if (!stripe) throw new Error('Stripe not loaded');

//       const result = await stripe.confirmPayment({
//         clientSecret,
//         confirmParams: {
//           return_url: window.location.origin + '/checkout', // simples
//         },
//       });

//       if (result.error) {
//         this.msg = 'Falha no pagamento: ' + result.error.message;
//       } else {
//         this.msg = 'Pagamento processando...';
//       }
//     } catch (e: any) {
//       this.msg = 'Erro: ' + (e?.message ?? 'desconhecido');
//     } finally {
//       this.loading = false;
//     }
//   }
// }

// src/app/features/checkout/checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../core/cart.service';
import { supabase } from '../../core/supabase.client';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule],
  template: `
    <h2>Checkout</h2>

    <ng-container *ngIf="totalCents > 0; else empty">
      <p>Total: <strong>{{ (totalCents/100) | currency:'BRL' }}</strong></p>

      <button (click)="pay()" [disabled]="loading">
        {{ loading ? 'Processando...' : 'Pagar (simulação)' }}
      </button>

      <p *ngIf="msg" style="margin-top:12px">{{ msg }}</p>

      <small style="display:block;margin-top:12px;opacity:.8">
        * Modo simulação: cria o pedido já como <code>paid</code> no Supabase (sem Stripe).
      </small>
    </ng-container>

    <ng-template #empty>
      <p>Seu carrinho está vazio.</p>
    </ng-template>
  `
})
export class CheckoutComponent implements OnInit {
  totalCents = 0;
  loading = false;
  msg = '';

  constructor(private http: HttpClient, private cart: CartService) {}

  ngOnInit() {
    this.totalCents = this.cart.totalCents();
  }

  async pay() {
    this.loading = true;
    this.msg = '';
    try {
      // se você estiver com RLS exigindo login, verifique sessão:
      const { data: sessionData } = await supabase.auth.getUser();
      const userId = sessionData.user?.id ?? null;

      // cria o pedido diretamente como "paid" (simulação, sem Stripe)
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: userId,            // se RLS bloquear sem login, logue antes
          total_cents: this.totalCents,
          currency: 'BRL',
          status: 'paid'
        })
        .select('*')
        .single();

      if (orderErr) throw orderErr;

      // (opcional) salvar itens do carrinho:
      // const items = this.cart.items().map(i => ({
      //   order_id: order.id,
      //   package_id: i.pkg.id,
      //   qty: i.qty,
      //   unit_price_cents: i.pkg.price_cents
      // }));
      // const { error: itemsErr } = await supabase.from('order_items').insert(items);
      // if (itemsErr) throw itemsErr;

      this.cart.clear();
      this.totalCents = 0;
      this.msg = '✅ Pedido criado como pago (simulação). Confira em Supabase → Table Editor → orders.';
    } catch (e: any) {
      // dica comum: se aparecer "permission denied" é por causa do RLS exigindo login
      this.msg = 'Erro: ' + (e?.message ?? 'desconhecido');
    } finally {
      this.loading = false;
    }
  }
}


// src/app/features/checkout/checkout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/cart.service';
import { supabase } from '../../core/supabase.client';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule],
  template: `
  <div class="container mt-5">
    <h1 class="mb-4">Checkout</h1>

    <div class="card shadow-sm p-4">
      <h4 class="fw-bold mb-3">
        Total: <span class="text-success">{{ (total/100) | currency:'BRL' }}</span>
      </h4>

      <button class="btn btn-success btn-lg mb-3" [disabled]="loading || total===0" (click)="pay()">
        <i class="bi bi-credit-card me-2"></i>
        {{ loading ? 'Processando...' : 'Pagar (simulação)' }}
      </button>

      <p class="text-muted small mb-0">
        * Modo simulação: cria o pedido já como <span class="text-danger fw-bold">paid</span> no Supabase (sem Stripe).
      </p>

      <p *ngIf="msg" class="mt-3"
         [class.text-success]="ok"
         [class.text-danger]="!ok">{{ msg }}</p>
    </div>
  </div>
  `
})
export class CheckoutComponent {
  loading = false;
  msg = '';
  ok = false;

  constructor(private cart: CartService) {}

  /** total em centavos (recalculado a cada render) */
  get total(): number {
    return this.cart.totalCents();
  }

  async pay() {
    if (this.total === 0) return;
    this.loading = true;
    this.msg = '';
    this.ok = false;

    try {
      const user = (await supabase.auth.getUser()).data.user;

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id ?? null,
          total_cents: this.total,
          currency: 'BRL',
          status: 'paid' // simulação
        })
        .select('*')
        .single();

      if (error) throw error;

      this.ok = true;
      this.msg = '✅ Pedido criado como pago (simulação).';
      this.cart.clear();
    } catch (e: any) {
      this.ok = false;
      this.msg = e?.message || 'Erro ao criar pedido.';
    } finally {
      this.loading = false;
    }
  }
}

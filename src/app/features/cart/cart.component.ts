// src/app/features/cart/cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  template: `
    <h2>🛒 Carrinho</h2>

    <ng-container *ngIf="items$ | async as items; else empty">
      <table class="cart" *ngIf="items.length; else empty">
        <thead>
          <tr>
            <th>Pacote</th>
            <th class="qty-col">Qtd</th>
            <th class="num">Preço</th>
            <th class="num">Total</th>
            <th style="width:100px"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let i of items; trackBy: trackById">
            <td class="title">{{ i.pkg.title }}</td>
            <td class="qty">{{ i.qty }}</td>
            <td class="num">{{ (i.pkg.price_cents/100) | currency:'BRL' }}</td>
            <td class="num">{{ (i.qty * i.pkg.price_cents / 100) | currency:'BRL' }}</td>
            <td><button (click)="remove(i.pkg.id)">Remover</button></td>
          </tr>
        </tbody>
      </table>

      <p class="grand" *ngIf="items.length">
        <strong>Total: {{ ((totalCents$ | async) ?? 0) / 100 | currency:'BRL' }}</strong>
      </p>

      <a routerLink="/checkout" *ngIf="items.length">Ir para o checkout</a>
    </ng-container>

    <ng-template #empty>
      <p>Seu carrinho está vazio.</p>
      <a routerLink="/pacotes">Ver pacotes</a>
    </ng-template>
  `,
  styles: [`
    .cart{width:100%;border-collapse:collapse;margin-top:8px}
    th,td{border:1px solid #ddd;padding:8px;vertical-align:middle}
    thead th{background:#fafafa}
    .title{word-break:break-word}
    .qty-col{width:72px;text-align:center}
    .qty{text-align:center}
    .num{text-align:right;white-space:nowrap}
    .grand{margin:12px 0}
  `]
})
export class CartComponent implements OnInit {
  items$!: Observable<any[]>;
  totalCents$!: Observable<number>;

  constructor(private cart: CartService) {}

  ngOnInit() {
    this.items$ = this.cart.items$;
    this.totalCents$ = this.items$.pipe(
      map(items => items.reduce((acc, i) => acc + i.qty * i.pkg.price_cents, 0))
    );
  }

  remove(id: number) { this.cart.remove(id); }

  trackById = (_: number, item: any) => item.pkg.id;
}

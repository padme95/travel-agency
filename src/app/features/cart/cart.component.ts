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
    <h2 class="h4 mb-3">Carrinho</h2>

    <ng-container *ngIf="items$ | async as items; else empty">
      <div *ngIf="items.length; else empty">

        <!-- MOBILE: cards (sem scroll lateral) -->
        <div class="d-sm-none">
          <div class="card mb-2" *ngFor="let i of items; trackBy: trackById">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-1">
                <h5 class="card-title mb-0 me-2">{{ i.pkg.title }}</h5>
                <button class="btn btn-outline-danger btn-sm" (click)="remove(i.pkg.id)">Remover</button>
              </div>
              <p class="card-text text-secondary mb-2">{{ i.pkg.description }}</p>
              <div class="d-flex flex-wrap gap-3">
                <span><strong>Qtd:</strong> {{ i.qty }}</span>
                <span><strong>Preço:</strong> {{ (i.pkg.price_cents/100) | currency:'BRL' }}</span>
                <span><strong>Total:</strong> {{ (i.qty * i.pkg.price_cents / 100) | currency:'BRL' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- DESKTOP/TABLET: tabela normal -->
        <div class="d-none d-sm-block">
          <div class="table-responsive">
            <table class="table align-middle">
              <thead class="table-light">
                <tr>
                  <th>Pacote</th>
                  <th class="text-center">Qtd</th>
                  <th class="text-end">Preço</th>
                  <th class="text-end">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let i of items; trackBy: trackById">
                  <td class="title">{{ i.pkg.title }}</td>
                  <td class="text-center">{{ i.qty }}</td>
                  <td class="text-end">{{ (i.pkg.price_cents/100) | currency:'BRL' }}</td>
                  <td class="text-end">{{ (i.qty * i.pkg.price_cents / 100) | currency:'BRL' }}</td>
                  <td><button class="btn btn-outline-danger btn-sm" (click)="remove(i.pkg.id)">Remover</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- total + checkout -->
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mt-3">
          <strong>Total: {{ ((totalCents$ | async) ?? 0) / 100 | currency:'BRL' }}</strong>
          <a routerLink="/checkout" class="btn btn-success">Ir para o checkout</a>
        </div>
      </div>
    </ng-container>

    <ng-template #empty>
      <div class="alert alert-info">Seu carrinho está vazio.</div>
      <a routerLink="/pacotes" class="btn btn-primary">Ver pacotes</a>
    </ng-template>
  `,
  styles: [`
    .title{word-break:break-word}
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

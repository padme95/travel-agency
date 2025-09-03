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
        <div class="table-responsive">
          <table class="table align-middle">
            <thead class="table-light">
              <tr>
                <th>Pacote</th>
                <th class="text-center" style="width:80px">Qtd</th>
                <th class="text-end col-price" style="width:140px">Preço</th>
                <th class="text-end" style="width:160px">Total</th>
                <th class="text-end" style="width:56px"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let i of items; trackBy: trackById">
                <td class="text-wrap">{{ i.pkg.title }}</td>
                <td class="text-center">{{ i.qty }}</td>
                <td class="text-end col-price">{{ (i.pkg.price_cents/100) | currency:'BRL' }}</td>
                <td class="text-end">{{ (i.qty*i.pkg.price_cents/100) | currency:'BRL' }}</td>
                <td class="text-end">
                  <button class="btn btn-outline-danger btn-sm"
                          (click)="remove(i.pkg.id)"
                          title="Remover"
                          aria-label="Remover item">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3">
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
    @media (max-width: 576px){
      .col-price { display: none; }
    }
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

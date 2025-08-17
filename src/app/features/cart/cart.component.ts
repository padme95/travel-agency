import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';

@Component({
  standalone: true,
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  template: `
  <h2>Carrinho</h2>
  <table *ngIf="items.length; else empty">
    <tr><th>Pacote</th><th>Qtd</th><th>Preço</th><th></th></tr>
    <tr *ngFor="let i of items">
      <td>{{i.pkg.title}}</td>
      <td>{{i.qty}}</td>
      <td>{{ (i.qty * i.pkg.price_cents / 100) | currency:'BRL' }}</td>
      <td><button (click)="remove(i.pkg.id)">Remover</button></td>
    </tr>
  </table>
  <ng-template #empty><p>Seu carrinho está vazio.</p></ng-template>

  <p *ngIf="items.length"><strong>Total: {{ total | currency:'BRL' }}</strong></p>
  <a *ngIf="items.length" routerLink="/checkout">Ir para o checkout</a>
  `
})
export class CartComponent {
  constructor(public cart: CartService) {}
  get items(){ return this.cart.items(); }
  get total(){ return this.cart.totalCents() / 100; }
  remove(id:number){ this.cart.remove(id); }
}

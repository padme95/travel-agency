// src/app/app.component.ts (adapte seu template)
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CartService } from './core/cart.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header style="padding:12px;border-bottom:1px solid #eee;display:flex;gap:16px">
      <a routerLink="/">Rosa & Ilías</a>
      <a routerLink="/pacotes">Pacotes</a>
      <a routerLink="/carrinho">Carrinho ({{ count }})</a>
    </header>
    <main style="padding:16px"><router-outlet/></main>
  `
})
export class AppComponent {
  constructor(private cart: CartService) {}
  get count(){ return this.cart.items().reduce((acc,i)=> acc + i.qty, 0); }
}

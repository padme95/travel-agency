import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
  <header style="display:flex;gap:16px;align-items:center">
    <a routerLink="/">Rosa & Ilías</a>
    <nav style="display:flex;gap:12px">
      <a routerLink="/pacotes">Pacotes</a>
      <a routerLink="/carrinho">Carrinho</a>
    </nav>
  </header>
  <main style="padding:16px"><router-outlet/></main>
  <footer style="padding:16px;border-top:1px solid #eee">© {{year}} Rosa & Ilías Viagens</footer>
  `
})
export class AppComponent { year = new Date().getFullYear(); }

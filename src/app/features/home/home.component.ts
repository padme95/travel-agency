import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="py-5 text-center">
    <h1 class="display-5 fw-bold">Sua próxima viagem começa aqui</h1>
    <p class="lead text-secondary">Pacotes selecionados, preços justos e checkout simples.</p>
    <a routerLink="/pacotes" class="btn btn-primary btn-lg mt-2">Explorar pacotes</a>
  </section>
  `
})
export class HomeComponent {}

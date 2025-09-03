import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="home-hero">
      <div class="home-hero__overlay"></div>
      <div class="home-hero__content">
        <h1 class="display-5 fw-bold mb-3">Sua próxima viagem começa aqui!</h1>
        <p class="lead mb-4">Pacotes selecionados, preços justos e checkout simples.</p>
        <a routerLink="/pacotes" class="btn btn-primary btn-lg">Explorar pacotes</a>
      </div>
    </section>
  `,
  styles: [`
    .home-hero{
      position: relative;
      width: 100%;
      min-height: 100vh;

      background-image: url('/bg-viagem.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;

      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .home-hero__overlay{
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.3); /* 👈 mais claro */
      z-index: 1;
    }

    .home-hero__content{
      position: relative;
      z-index: 2;
      color: #fff;
      text-shadow: 0 2px 8px rgba(0,0,0,.45);
      padding: 0 16px;
      max-width: 800px;
    }

    @media (max-width: 576px) {
      .home-hero{ min-height: calc(100vh - 56px); }
    }
  `]
})
export class HomeComponent {}

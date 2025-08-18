// src/app/app.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from './core/auth.service';
import { CartService } from './core/cart.service';
import { IdleLogoutService } from './core/idle-logout.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AsyncPipe, NgIf],
  template: `
    <!-- Banner de confirmação de e-mail -->
    <div *ngIf="bannerConfirmed" class="py-2 px-3" style="background:#e8f7ee;color:#14532d">
      ✅ Email confirmado! Faça login para continuar.
      <a routerLink="/auth/login" [queryParams]="{ next: nextParam }" class="ms-1 text-decoration-underline">
        Entrar
      </a>
    </div>

    <!-- Banner de logout por inatividade -->
    <div *ngIf="bannerIdle" class="alert alert-warning m-0 rounded-0 text-center">
      Você foi desconectado por inatividade.
    </div>

    <nav class="navbar navbar-expand-lg navbar-light bg-body-tertiary">
      <div class="container align-items-center">
        <!-- Marca -->
        <a class="navbar-brand" routerLink="/">Rosílias Turismo</a>

        <!-- Área direita do topo: carrinho + hamburguer -->
        <div class="ms-auto d-flex align-items-center gap-2">
          <!-- Ícone do carrinho (sempre visível) -->
          <a class="nav-link position-relative p-0 me-2 d-flex align-items-center gap-1"
             routerLink="/carrinho" aria-label="Carrinho">
            <i class="bi bi-cart fs-4"></i>
            <span class="d-none d-lg-inline">Carrinho</span>
            <span *ngIf="count > 0"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {{ count }}
            </span>
          </a>

          <!-- Botão hamburguer -->
          <button class="navbar-toggler" type="button"
                  data-bs-toggle="collapse" data-bs-target="#navMain"
                  aria-controls="navMain" aria-expanded="false" aria-label="Alternar navegação">
            <span class="navbar-toggler-icon"></span>
          </button>
        </div>

        <!-- Menu colapsável -->
        <div id="navMain" class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item"><a class="nav-link" routerLink="/pacotes">Pacotes</a></li>
          </ul>

          <!-- Usuário logado -->
          <div *ngIf="auth.user$ | async as user; else guestBlock" class="d-flex gap-2 align-items-center">
            <small class="text-secondary d-none d-sm-inline">Olá, {{ user?.email }}</small>
            <button class="btn btn-outline-secondary btn-sm" (click)="signOut()">Sair</button>
          </div>

          <!-- Visitante (esconde somente quando banner de confirmação aparece) -->
          <ng-template #guestBlock>
            <div *ngIf="!bannerConfirmed" class="d-flex gap-2">
              <a class="btn btn-outline-primary btn-sm" routerLink="/auth/login">Entrar</a>
              <a class="btn btn-primary btn-sm" routerLink="/auth/signup">Cadastrar</a>
            </div>
          </ng-template>
        </div>
      </div>
    </nav>

    <main class="container py-4">
      <router-outlet/>
    </main>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private cart = inject(CartService);
  private route = inject(ActivatedRoute);
  private idle = inject(IdleLogoutService);

  count = 0;
  bannerConfirmed = false;  // "Email confirmado!"
  bannerIdle = false;       // "desconectado por inatividade"
  nextParam: string | null = null;

  private destroy$ = new Subject<void>();

  ngOnInit() {
    // contador reativo do carrinho
    this.cart.items$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => this.count = items.reduce((a, i) => a + i.qty, 0));

    // banners com base nos query params
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(qp => {
        this.bannerConfirmed = qp.get('m') === 'confirmed';
        // mostra banner de inatividade se veio via query param
        this.bannerIdle = qp.get('m') === 'idle' || this.bannerIdle;

        this.nextParam = qp.get('next') || '/';

        // se veio via query param (m=idle), oculta após 5s
        if (this.bannerIdle) {
          setTimeout(() => (this.bannerIdle = false), 5000);
        }
      });

    // liga/desliga o watcher de inatividade conforme login
    this.auth.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.bannerIdle = false;
          this.idle.start();
        } else {
          this.idle.stop();
        }
      });

    // ouve o evento de logout por inatividade e mostra banner
    this.idle.idleLogout$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.bannerIdle = true;
        setTimeout(() => (this.bannerIdle = false), 5000);
      });

    // se houve logout por inatividade numa navegação direta/refresh, mostra banner
    if (sessionStorage.getItem('idle-logged-out') === '1') {
      this.bannerIdle = true;
      sessionStorage.removeItem('idle-logged-out');
      setTimeout(() => (this.bannerIdle = false), 5000);
    }
  }

  signOut() {
    // logout manual: tira flag de idle (se existir)
    sessionStorage.removeItem('idle-logged-out');
    this.auth.signOut();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

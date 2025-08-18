// src/app/app.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from './core/auth.service';
import { CartService } from './core/cart.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AsyncPipe, NgIf],
  template: `
    <!-- Banner de confirmação -->
    <div *ngIf="banner" class="py-2 px-3" style="background:#e8f7ee;color:#14532d">
      ✅ Email confirmado! Faça login para continuar.
      <a routerLink="/auth/login" [queryParams]="{ next: nextParam }" class="ms-1 text-decoration-underline">
        Entrar
      </a>
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
            <button class="btn btn-outline-secondary btn-sm" (click)="auth.signOut()">Sair</button>
          </div>

          <!-- Visitante (esconde quando banner aparece) -->
          <ng-template #guestBlock>
            <div *ngIf="!banner" class="d-flex gap-2">
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

  count = 0;
  banner = false;
  nextParam: string | null = null;

  private destroy$ = new Subject<void>();

  ngOnInit() {
    // contador reativo
    this.cart.items$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => this.count = items.reduce((a, i) => a + i.qty, 0));

    // banner de confirmação
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(qp => {
        this.banner = qp.get('m') === 'confirmed';
        this.nextParam = qp.get('next') || '/';
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

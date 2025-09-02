import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from './core/auth.service';
import { CartService } from './core/cart.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AsyncPipe, NgIf],
  styles: [`
    .navbar-mobile-fixed { box-shadow: 0 2px 10px rgba(0,0,0,.05); }
    @media (max-width: 991.98px){
      .navbar-mobile-fixed{
        position: sticky;
        top: 0;
        z-index: 1030;
      }
    }

    .cart-badge{
      position:absolute;
      top:-4px; left:100%;
      transform: translate(-40%, -40%);
    }

    @media (max-width: 991.98px){ .w-mobile-100{ width:100%; } }
  `],
  template: `
    <div *ngIf="banner" class="py-2 px-3" style="background:#e8f7ee;color:#14532d">
      ✅ Email confirmado! Faça login para continuar.
      <a routerLink="/auth/login" [queryParams]="{ next: nextParam }" class="ms-1 text-decoration-underline">
        Entrar
      </a>
    </div>

    <nav class="navbar navbar-expand-lg bg-body-tertiary navbar-mobile-fixed">
      <div class="container align-items-center">
        <a class="navbar-brand" routerLink="/">Rosílias Turismo</a>
        <div class="ms-auto d-flex align-items-center gap-2">
          <a class="nav-link position-relative p-0 me-2 d-flex align-items-center gap-1"
             routerLink="/carrinho" aria-label="Carrinho">
            <i class="bi bi-cart fs-4"></i>
            <span class="d-none d-lg-inline">Carrinho</span>
            <span *ngIf="count > 0" class="badge rounded-pill bg-danger cart-badge">{{ count }}</span>
          </a>

          <button class="navbar-toggler" type="button"
                  data-bs-toggle="collapse" data-bs-target="#navMain"
                  aria-controls="navMain" aria-expanded="false" aria-label="Alternar navegação">
            <span class="navbar-toggler-icon"></span>
          </button>
        </div>

        <div id="navMain" class="collapse navbar-collapse">
<ng-container *ngIf="auth.user$ | async as user; else guestBlock">
  <div class="d-flex flex-column flex-lg-row gap-2 align-items-lg-center ms-auto">
    <span class="d-none d-lg-inline small text-secondary text-nowrap">
      Olá, {{ user?.email }}
    </span>
    <a class="btn btn-primary btn-sm w-100 w-lg-auto" routerLink="/pacotes">Pacotes</a>
    <button class="btn btn-outline-secondary btn-sm w-100 w-lg-auto" (click)="auth.signOut()">Sair</button>
  </div>
</ng-container>

          <ng-template #guestBlock>
            <div *ngIf="!banner" class="d-flex flex-column flex-lg-row gap-2 align-items-lg-center ms-auto">
              <!-- <a class="btn btn-primary btn-sm w-100 w-lg-auto" routerLink="/pacotes">Pacotes</a> -->
              <a class="btn btn-outline-primary btn-sm w-100 w-lg-auto" routerLink="/auth/login">Entrar</a>
              <a class="btn btn-primary btn-sm w-100 w-lg-auto" routerLink="/auth/signup">Cadastrar</a>
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
    this.cart.items$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => this.count = items.reduce((a, i) => a + i.qty, 0));

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

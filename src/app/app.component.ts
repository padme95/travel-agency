import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from './core/auth.service';
import { CartService } from './core/cart.service';
import { Subject, takeUntil, filter } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AsyncPipe, NgIf],
  template: `
    <div *ngIf="banner" class="py-2 px-3" style="background:#e8f7ee;color:#14532d">
      ✅ Email confirmado! Faça login para continuar.
      <a routerLink="/auth/login" [queryParams]="{ next: nextParam }" class="ms-1 text-decoration-underline">
        Entrar
      </a>
    </div>
    <nav class="navbar navbar-expand-lg navbar-light bg-body-tertiary sticky-top">
      <div class="container-fluid px-3">
        <a class="navbar-brand" routerLink="/">Rosílias Turismo</a>

        <div class="ms-auto d-flex align-items-center gap-2">
          <a class="nav-link position-relative p-0 me-2 d-flex align-items-center gap-1"
             routerLink="/carrinho" aria-label="Carrinho">
            <i class="bi bi-cart fs-4"></i>
            <span *ngIf="count > 0"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {{ count }}
            </span>
          </a>

          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain"
                  aria-controls="navMain" aria-expanded="false" aria-label="Alternar navegação">
            <span class="navbar-toggler-icon"></span>
          </button>
        </div>

        <div id="navMain" class="collapse navbar-collapse">
          <div *ngIf="auth.user$ | async as user; else guestBlock"
               class="d-flex gap-2 align-items-center ms-auto">
            <small class="text-secondary text-nowrap">Olá, {{ user?.email }}</small>
            <a class="btn btn-outline-primary btn-sm" routerLink="/pacotes">Pacotes</a>
            <button class="btn btn-outline-secondary btn-sm" (click)="auth.signOut()">Sair</button>
          </div>

          <ng-template #guestBlock>
            <div *ngIf="!banner" class="d-flex gap-2 ms-auto">
              <a class="btn btn-outline-primary btn-sm" routerLink="/auth/login">Entrar</a>
              <a class="btn btn-primary btn-sm" routerLink="/auth/signup">Cadastrar</a>
            </div>
          </ng-template>
        </div>
      </div>
    </nav>

    <main [class.main-home]="isHome" [class.main-full]="!isHome">
      <router-outlet />
    </main>
  `,
  styles: [`
    .main-full{
      width: 100%;
      min-height: 100%;
      padding: 2rem 1rem;
    }
    .main-home{
      width: 100%;
      min-height: 100%;
      padding: 0;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private cart = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  count = 0;
  banner = false;
  nextParam: string | null = null;
  isHome = false;

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

    this.isHome = this.router.url === '/';
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe(() => {
        this.isHome = this.router.url === '/';
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

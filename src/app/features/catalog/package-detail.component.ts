import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PackagesService } from '../../core/packages.service';
import { CartService } from '../../core/cart.service';
import { Package } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-package-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <ng-container *ngIf="pkg as p; else loading">
      <nav class="mb-3">
        <a routerLink="/pacotes" class="text-decoration-none">&larr; Voltar para pacotes</a>
      </nav>

      <div class="row g-4 align-items-start">
        <div class="col-12 col-md-6">
          <img *ngIf="p.image_url"
               [src]="p.image_url"
               [alt]="p.title"
               class="img-fluid rounded border" />
        </div>

        <div class="col-12 col-md-6">
          <h1 class="display-5 fw-bold mb-2">{{ p.title }}</h1>
          <p class="text-secondary mb-4">{{ p.description }}</p>

          <div class="d-flex align-items-center gap-3 mb-3">
            <span class="h4 mb-0 fw-bold">{{ (p.price_cents/100) | currency:'BRL' }}</span>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-primary" (click)="add()">
              <i class="bi bi-cart-plus me-1"></i> Adicionar ao carrinho
            </button>
            <a class="btn btn-outline-secondary" routerLink="/carrinho">Ver carrinho</a>
          </div>
        </div>
      </div>
    </ng-container>

    <ng-template #loading>
      <div class="placeholder-glow">
        <span class="placeholder col-6"></span>
        <span class="placeholder col-12"></span>
        <span class="placeholder col-8"></span>
      </div>
    </ng-template>
  `
})
export class PackageDetailComponent implements OnInit {
  pkg?: Package;

  constructor(
    private route: ActivatedRoute,
    private api: PackagesService,
    private cart: CartService
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.api.bySlug(slug).subscribe(({ data }: any) => {
      this.pkg = Array.isArray(data) ? data[0] as Package : (data as Package);
    });
  }

  add() {
    if (this.pkg) this.cart.add(this.pkg, 1);
  }
}

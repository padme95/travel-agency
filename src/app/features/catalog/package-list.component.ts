import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PackagesService } from '../../core/packages.service';
import { CartService } from '../../core/cart.service';
import { Package } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-package-list',
  imports: [CommonModule, RouterLink],
  template: `
 <h2 class="h4 mb-3">Pacotes</h2>
  <div class="row g-3">
    <div class="col-12 col-sm-6 col-lg-4" *ngFor="let p of packages">
      <div class="card h-100">
        <img *ngIf="p.image_url" [src]="p.image_url" class="card-img-top" [alt]="p.title">
        <div class="card-body d-flex flex-column">
          <h3 class="h6 card-title mb-1">{{ p.title }}</h3>
          <p class="card-text text-secondary small flex-grow-1">{{ p.description }}</p>
          <div class="d-flex justify-content-between align-items-center">
            <strong>{{ (p.price_cents/100) | currency:'BRL' }}</strong>
            <div class="d-flex gap-2">
              <a class="btn btn-outline-secondary btn-sm" [routerLink]="['/pacotes', p.slug]">Detalhes</a>
              <button class="btn btn-primary btn-sm" (click)="add(p)">Adicionar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px} article{border:1px solid #ddd;border-radius:8px;padding:12px}`]
})
export class PackageListComponent implements OnInit {
  packages: Package[] = [];
  constructor(private api: PackagesService, private cart: CartService) {}

  ngOnInit() {
    this.api.list().subscribe(({ data }) => this.packages = (data as Package[]) ?? []);
  }
   add(p: Package) {
    this.cart.add(p, 1);
  }
}

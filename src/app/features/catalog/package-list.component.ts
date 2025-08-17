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
  <section class="grid">
    <article *ngFor="let p of packages">
      <img *ngIf="p.image_url" [src]="p.image_url" alt="{{p.title}}" />
      <h3><a [routerLink]="['/pacotes', p.slug]">{{ p.title }}</a></h3>
      <p>{{ p.description }}</p>
      <strong>{{ (p.price_cents/100) | currency:'BRL' }}</strong>
      <button (click)="add(p)">Adicionar</button>
    </article>
  </section>
  `,
  styles: [`.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px} article{border:1px solid #ddd;border-radius:8px;padding:12px}`]
})
export class PackageListComponent implements OnInit {
  packages: Package[] = [];
  constructor(private api: PackagesService, private cart: CartService) {}

  ngOnInit() {
    this.api.list().subscribe(({ data }) => this.packages = (data as Package[]) ?? []);
  }
  add(p: Package){ this.cart.add(p, 1); }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PackagesService } from '../../core/packages.service';
import { CartService } from '../../core/cart.service';
import { Package } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-package-detail',
  imports: [CommonModule],
  template: `
  <ng-container *ngIf="pkg">
    <img *ngIf="pkg.image_url" [src]="pkg.image_url" alt="{{pkg.title}}" style="max-width:480px"/>
    <h1>{{ pkg.title }}</h1>
    <p>{{ pkg.description }}</p>
    <strong>{{ (pkg.price_cents/100) | currency:'BRL' }}</strong>
    <div><button (click)="add()">Adicionar ao carrinho</button></div>
  </ng-container>
  `
})
export class PackageDetailComponent implements OnInit {
  pkg?: Package;
  constructor(private route: ActivatedRoute, private api: PackagesService, private cart: CartService) {}
  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.api.bySlug(slug).subscribe(({ data }) => this.pkg = data as Package);
  }
  add(){ if(this.pkg) this.cart.add(this.pkg, 1); }
}

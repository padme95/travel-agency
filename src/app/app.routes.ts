import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { PackageListComponent } from './features/catalog/package-list.component';
import { PackageDetailComponent } from './features/catalog/package-detail.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'pacotes', component: PackageListComponent },
  { path: 'pacotes/:slug', component: PackageDetailComponent },
  { path: 'carrinho', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: '**', redirectTo: '' },
];

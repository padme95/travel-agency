// src/app/app.routes.ts (adicione/imports)
import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { PackageListComponent } from './features/catalog/package-list.component';
import { PackageDetailComponent } from './features/catalog/package-detail.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { LoginComponent } from './features/auth/login.component';
import { SignupComponent } from './features/auth/signup.component';
import { authGuard } from './core/auth.guard';
import { AuthCallbackComponent } from './features/auth/callback.component';
import { ResetComponent,  } from './features/auth/reset-password.component';
import { ForgotComponent } from './features/auth/forgot.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'pacotes', component: PackageListComponent },
  { path: 'pacotes/:slug', component: PackageDetailComponent },
  { path: 'carrinho', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/signup', component: SignupComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'auth/reset', component: ResetComponent },
  { path: 'auth/forgot', component: ForgotComponent },

  { path: '**', redirectTo: '' },
];

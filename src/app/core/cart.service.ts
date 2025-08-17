// src/app/core/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Package } from './models';

export type CartItem = { pkg: Package; qty: number };
const KEY = 'cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private state = new BehaviorSubject<CartItem[]>(this.load());
  readonly items$ = this.state.asObservable();

  private load(): CartItem[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }
  private save(items: CartItem[]) { localStorage.setItem(KEY, JSON.stringify(items)); }

  items() { return this.state.value; } // snapshot
  totalCents() { return this.state.value.reduce((a,i)=> a + i.qty*i.pkg.price_cents, 0); }

  add(pkg: Package, qty = 1) {
    const items = [...this.state.value];
    const idx = items.findIndex(i => i.pkg.id === pkg.id);
    if (idx !== -1) items[idx] = { ...items[idx], qty: items[idx].qty + qty };
    else items.push({ pkg, qty });
    this.save(items);
    this.state.next(items);
  }

  remove(packageId: number) {
    const items = this.state.value.filter(i => i.pkg.id !== packageId);
    this.save(items);
    this.state.next(items);
  }

  clear() {
    this.save([]);
    this.state.next([]);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Package } from './models';

export interface CartItem {
  pkg: Package;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly GUEST_KEY = 'cart_guest_v1';
  private currentKey = this.GUEST_KEY;

  private itemsSubject = new BehaviorSubject<CartItem[]>(this.load(this.currentKey));
  items$ = this.itemsSubject.asObservable();

  switchToUser(uid: string) {
    const userKey = this.userKey(uid);
    const guestItems = this.load(this.GUEST_KEY);
    const userItems = this.load(userKey);

    const merged = this.merge(userItems, guestItems);
    this.save(userKey, merged);
    this.save(this.GUEST_KEY, []); // limpa o carrinho de convidado

    this.currentKey = userKey;
    this.itemsSubject.next(this.load(this.currentKey));
  }

  switchToGuest() {
    this.currentKey = this.GUEST_KEY;
    this.itemsSubject.next(this.load(this.currentKey));
  }

  add(pkg: Package, qty = 1) {
    const list = [...this.itemsSubject.value];
    const idx = list.findIndex(i => i.pkg.id === pkg.id);
    if (idx >= 0) {
      list[idx] = { pkg: list[idx].pkg, qty: list[idx].qty + qty };
    } else {
      list.push({ pkg, qty });
    }
    this.commit(list);
  }


  addById(pkgId: number, delta: number) {
    const list = [...this.itemsSubject.value];
    const idx = list.findIndex(i => i.pkg.id === pkgId);
    if (idx >= 0) {
      const newQty = list[idx].qty + delta;
      if (newQty <= 0) {
        list.splice(idx, 1);
      } else {
        list[idx] = { pkg: list[idx].pkg, qty: newQty };
      }
      this.commit(list);
    }
  }

  setQty(pkgId: number, qty: number) {
    const list = [...this.itemsSubject.value];
    const idx = list.findIndex(i => i.pkg.id === pkgId);
    if (idx >= 0) {
      if (qty <= 0) list.splice(idx, 1);
      else list[idx] = { pkg: list[idx].pkg, qty };
      this.commit(list);
    }
  }

  remove(pkgId: number) {
    const list = this.itemsSubject.value.filter(i => i.pkg.id !== pkgId);
    this.commit(list);
  }

  clear() { this.commit([]); }

  items() { return this.itemsSubject.value; }

  totalCents() {
    return this.itemsSubject.value.reduce((acc, i) => acc + i.qty * i.pkg.price_cents, 0);
  }

  private userKey(uid: string) {
    return `cart_user_${uid}_v1`;
  }

  private load(key: string): CartItem[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  private save(key: string, items: CartItem[]) {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {}
  }

  private commit(list: CartItem[]) {
    this.save(this.currentKey, list);
    this.itemsSubject.next(list);
  }

  private merge(base: CartItem[], add: CartItem[]) {
    const map = new Map<number, CartItem>();
    for (const it of base) map.set(it.pkg.id, { ...it });
    for (const it of add) {
      const found = map.get(it.pkg.id);
      if (found) map.set(it.pkg.id, { pkg: found.pkg, qty: found.qty + it.qty });
      else map.set(it.pkg.id, { ...it });
    }
    return Array.from(map.values());
  }
}

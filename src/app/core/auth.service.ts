import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { supabase } from './supabase.client';
import { CartService } from './cart.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private cart = inject(CartService);
  user$ = new BehaviorSubject<any | null>(null);

  constructor() {
    supabase.auth.getUser().then(({ data }) => {
      this.user$.next(data.user ?? null);
      if (data.user) this.cart.switchToUser(data.user.id);
      else this.cart.switchToGuest();
    });

    supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      this.user$.next(user);

      if (user) this.cart.switchToUser(user.id);
      else this.cart.switchToGuest();
    });
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.user$.next(data.user);
    this.cart.switchToUser(data.user!.id);
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    this.user$.next(null);
    this.cart.switchToGuest();
  }
}

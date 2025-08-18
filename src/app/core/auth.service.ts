// src/app/core/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { supabase } from './supabase.client';

export type AuthUser = { id: string; email?: string | null };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<AuthUser | null>(null);
  readonly user$ = this._user$.asObservable();

  constructor() { this.bootstrap(); }

  private async bootstrap() {
    const { data } = await supabase.auth.getUser();
    this._user$.next(data.user ? { id: data.user.id, email: data.user.email } : null);
    supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ? { id: session.user.id, email: session.user.email } : null;
      this._user$.next(u);
    });
  }

  get currentUser(): AuthUser | null { return this._user$.value; }

  async signUp(email: string, password: string, emailRedirectTo: string) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo }
    });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

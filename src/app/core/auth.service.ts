import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  session = () => supabase.auth.getSession();
  signIn(email: string, password: string) { return supabase.auth.signInWithPassword({ email, password }); }
  signUp(email: string, password: string) { return supabase.auth.signUp({ email, password }); }
  signOut() { return supabase.auth.signOut(); }
}

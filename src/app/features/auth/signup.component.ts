// src/app/features/auth/signup.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { supabase } from '../../core/supabase.client';

@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h2>Criar conta</h2>
    <form (ngSubmit)="submit()">
      <label>Email<br><input [(ngModel)]="email" name="email" type="email" required></label><br><br>
      <label>Senha<br><input [(ngModel)]="password" name="password" type="password" required minlength="6"></label><br><br>

      <button [disabled]="loading">{{ loading ? 'Enviando...' : 'Cadastrar' }}</button>
      <p *ngIf="msg" [style.color]="error ? 'crimson' : '#14532d'">{{ msg }}</p>
    </form>

    <div *ngIf="offerReset" style="margin-top:12px;padding:8px;border:1px solid #eee;border-radius:6px">
      <strong>Já existe uma conta com este e-mail.</strong><br>
      <button (click)="sendReset()" [disabled]="loadingReset">
        {{ loadingReset ? 'Enviando link...' : 'Recuperar senha' }}
      </button>
      <p *ngIf="resetMsg" [style.color]="resetErr ? 'crimson' : '#14532d'">{{ resetMsg }}</p>
    </div>

    <p style="margin-top:12px">
      Já tem conta? <a routerLink="/auth/login" [queryParams]="{ next: next }">Entrar</a>
    </p>
  `
})
export class SignupComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = false;
  msg = '';
  error = false;

  offerReset = false;
  loadingReset = false;
  resetMsg = '';
  resetErr = false;

  next = this.route.snapshot.queryParamMap.get('next') || '/';

  async submit() {
    this.loading = true; this.msg = ''; this.error = false; this.offerReset = false;
    try {
      const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(this.next)}`;
      const { data, error } = await supabase.auth.signUp({
        email: this.email,
        password: this.password,
        options: { emailRedirectTo: redirect }
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
          this.offerReset = true;
          this.error = true;
          this.msg = 'Já existe uma conta com este e-mail.';
          return;
        }
        throw error;
      }

      // ⚡️ Verifica se o usuário já existia mas não tinha confirmado
      if (data.user && Array.isArray((data.user as any).identities) && (data.user as any).identities.length === 0) {
        this.offerReset = true;
        this.error = true;
        this.msg = 'Já existe uma conta com este e-mail (ainda não confirmada).';
        return;
      }

      this.msg = 'Enviamos um e-mail de confirmação. Clique no link para continuar.';
    } catch (e: any) {
      this.msg = e?.message || 'Falha ao criar conta';
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  async sendReset() {
    this.resetMsg = ''; this.resetErr = false; this.loadingReset = true;
    try {
      const redirectTo = `${window.location.origin}/auth/reset?next=${encodeURIComponent(this.next)}`;
      const { error } = await supabase.auth.resetPasswordForEmail(this.email, { redirectTo });
      if (error) throw error;
      this.resetMsg = 'Enviamos um link de recuperação para seu email.';
    } catch (e: any) {
      this.resetMsg = e?.message || 'Falha ao enviar link de recuperação';
      this.resetErr = true;
    } finally {
      this.loadingReset = false;
    }
  }
}

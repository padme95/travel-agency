import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { supabase } from '../../core/supabase.client';

@Component({
  standalone: true,
  selector: 'app-reset',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <section class="container auth-shell justify-content-center">
    <div class="w-100" style="max-width:480px">
      <div class="text-center mb-4">
        <h1 class="h3 fw-bold mb-1">Definir nova senha</h1>
        <p class="text-secondary mb-0">Abra esta página pelo link do e-mail</p>
      </div>

      <div class="card shadow-sm">
        <div class="card-body p-4">
          <div *ngIf="checking" class="text-center my-3">
            <div class="spinner-border" role="status"></div>
            <div class="small text-secondary mt-2">Verificando link…</div>
          </div>

          <div *ngIf="!checking && !ready" class="alert alert-warning">
            Link inválido ou expirado. <a routerLink="/auth/forgot" class="alert-link">Solicitar novo link</a>.
          </div>

          <form #f="ngForm" (ngSubmit)="submit(f)" novalidate *ngIf="!checking">
            <div class="mb-3">
              <label class="form-label">Nova senha</label>
              <div class="input-group">
                <input [type]="show ? 'text' : 'password'" class="form-control"
                       name="password" [(ngModel)]="password"
                       required minlength="6" [disabled]="!ready"
                       [class.is-invalid]="f.submitted && !f.controls['password']?.valid">
                <button type="button" class="btn btn-outline-secondary" (click)="show = !show">
                  <i class="bi" [class.bi-eye]="!show" [class.bi-eye-slash]="show"></i>
                </button>
              </div>
              <div class="form-text">Mínimo de 6 caracteres.</div>
              <div class="invalid-feedback d-block" *ngIf="f.submitted && !f.controls['password']?.valid">
                Informe uma senha válida.
              </div>
            </div>

            <button class="btn btn-primary w-100" [disabled]="loading || !ready">
              <span *ngIf="!loading"><i class="bi bi-check2-circle me-1"></i> Salvar nova senha</span>
              <span *ngIf="loading">Salvando...</span>
            </button>

            <p *ngIf="msg" class="mt-3 mb-0"
               [class.text-danger]="error" [class.text-success]="!error">{{ msg }}</p>
          </form>

          <div class="text-center mt-3" *ngIf="!checking">
            <a routerLink="/auth/login" class="small">Voltar ao login</a>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
})
export class ResetComponent {
  private router = inject(Router);

  password = '';
  show = false;
  loading = false;

  checking = true;
  ready = false;
  msg = '';
  error = false;

  constructor() { this.ensureSessionFromUrl(); }

  private async ensureSessionFromUrl() {
    try {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      let type = hash.get('type') || undefined as any;
      let access_token = hash.get('access_token') || undefined as any;
      let refresh_token = hash.get('refresh_token') || undefined as any;

      const qs = new URLSearchParams(window.location.search);
      type = type || (qs.get('type') as any);
      access_token = access_token || qs.get('access_token') || qs.get('token') || undefined as any;
      refresh_token = refresh_token || qs.get('refresh_token') || undefined as any;

      const code = qs.get('code');
      if (!access_token && code) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;
        this.ready = true;
        this.checking = false;
        return;
      }


      if ((type === 'recovery' || type === 'signup' || type === 'magiclink') && access_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || ''
        });
        if (error) throw error;
        this.ready = true;
      } else {
        const { data } = await supabase.auth.getSession();
        this.ready = !!data.session;
      }
    } catch {
      this.ready = false;
    } finally {
      this.checking = false;
    }
  }

  async submit(f: NgForm) {
    if (f.invalid || !this.ready) return;
    this.loading = true; this.msg = ''; this.error = false;
    try {
      const { error } = await supabase.auth.updateUser({ password: this.password });
      if (error) throw error;
      this.msg = 'Senha atualizada com sucesso! Faça login novamente.';
      setTimeout(() => this.router.navigate(['/auth/login'], { queryParams: { m: 'reset_ok' } }), 1200);
    } catch (e: any) {
      this.error = true;
      this.msg = e?.message || 'Não foi possível alterar a senha. Solicite um novo link.';
    } finally {
      this.loading = false;
    }
  }
}

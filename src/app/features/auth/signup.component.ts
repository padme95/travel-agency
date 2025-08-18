import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { supabase } from '../../core/supabase.client';

@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <section class="container auth-shell justify-content-center">
    <div class="w-100" style="max-width: 480px;">
      <div class="text-center mb-4">
        <h1 class="h3 fw-bold mb-1">Criar conta</h1>
        <p class="text-secondary mb-0">Leva menos de 1 minuto</p>
      </div>

      <div class="card shadow-sm">
        <div class="card-body p-4">
          <form #f="ngForm" (ngSubmit)="submit(f)" novalidate>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input class="form-control" type="email" name="email"
                     [(ngModel)]="email" required email
                     [class.is-invalid]="f.submitted && !f.controls['email'].valid">
              <div class="invalid-feedback">Informe um email válido.</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Senha</label>
              <div class="input-group">
                <input [type]="show ? 'text' : 'password'" class="form-control"
                       name="password" [(ngModel)]="password" required minlength="6"
                       [class.is-invalid]="f.submitted && !f.controls['password'].valid">
                <button class="btn btn-outline-secondary" type="button" (click)="show = !show">
                  <i class="bi" [class.bi-eye]="!show" [class.bi-eye-slash]="show"></i>
                </button>
              </div>
              <div class="invalid-feedback d-block" *ngIf="f.submitted && !f.controls['password']?.valid">
                Mínimo de 6 caracteres.
              </div>
            </div>

            <button class="btn btn-primary w-100" [disabled]="loading">
              <span *ngIf="!loading"><i class="bi bi-person-plus me-1"></i> Cadastrar</span>
              <span *ngIf="loading">Enviando...</span>
            </button>

            <p *ngIf="msg" class="mt-3 mb-0" [class.text-danger]="error" [class.text-success]="!error">{{ msg }}</p>
          </form>

          <div *ngIf="offerReset" class="alert alert-warning d-flex align-items-start gap-2 mt-3">
            <i class="bi bi-info-circle mt-1"></i>
            <div>
              <div class="fw-semibold">Já existe uma conta com este e-mail.</div>
              <button class="btn btn-outline-secondary btn-sm mt-2" (click)="sendReset()" [disabled]="loadingReset">
                {{ loadingReset ? 'Enviando link...' : 'Recuperar senha' }}
              </button>
              <div class="small mt-2" [class.text-danger]="resetErr" [class.text-success]="!resetErr">{{ resetMsg }}</div>
            </div>
          </div>

          <div class="text-center mt-3">
            <span class="text-secondary">Já tem conta?</span>
            <a routerLink="/auth/login" [queryParams]="{ next: next }" class="ms-1">Entrar</a>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
})
export class SignupComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  show = false;
  loading = false;
  msg = '';
  error = false;

  offerReset = false;
  loadingReset = false;
  resetMsg = '';
  resetErr = false;

  next = this.route.snapshot.queryParamMap.get('next') || '/';

  async submit(f: NgForm) {
    if (f.invalid) return;
    this.loading = true; this.msg = ''; this.error = false; this.offerReset = false;

    try {
      const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(this.next)}`;
      const { data, error } = await supabase.auth.signUp({
        email: this.email,
        password: this.password,
        options: { emailRedirectTo: redirect }
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
          this.offerReset = true;
          this.error = true;
          this.msg = 'Já existe uma conta com este e-mail.';
          return;
        }
        throw error;
      }

      const alreadyUnconfirmed =
        !!data?.user &&
        Array.isArray((data.user as any).identities) &&
        (data.user as any).identities.length === 0;

      if (alreadyUnconfirmed) {
        this.offerReset = true;
        this.error = true;
        this.msg = 'Já existe uma conta com este e-mail (ainda não confirmada).';
        return;
      }

      this.msg = 'Enviamos um e-mail de confirmação. Clique no link para continuar.';
    } catch (e: any) {
      this.error = true;
      this.msg = e?.message || 'Falha ao criar conta';
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
      this.resetMsg = 'Enviamos um link de recuperação para seu e-mail.';
    } catch (e: any) {
      this.resetMsg = e?.message || 'Falha ao enviar link de recuperação';
      this.resetErr = true;
    } finally {
      this.loadingReset = false;
    }
  }
}

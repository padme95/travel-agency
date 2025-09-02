import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <section class="container auth-shell justify-content-center">
    <div class="w-100" style="max-width: 420px;">
      <div class="text-center mb-4">
        <h1 class="h3 fw-bold mb-1">Entrar</h1>
        <p class="text-secondary mb-0">Acesse sua conta para continuar</p>
      </div>

      <div class="card shadow-sm">
        <div class="card-body p-4">
          <form #f="ngForm" (ngSubmit)="submit(f)" novalidate>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input
                class="form-control"
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                email
                [class.is-invalid]="f.submitted && !f.controls['email']?.valid">
              <div class="invalid-feedback">Informe um email válido.</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Senha</label>
              <div class="input-group">
                <input
                  [type]="show ? 'text' : 'password'"
                  class="form-control"
                  name="password"
                  [(ngModel)]="password"
                  required minlength="6"
                  [class.is-invalid]="f.submitted && !f.controls['password']?.valid">
                <button class="btn btn-outline-secondary" type="button" (click)="show = !show">
                  <i class="bi" [class.bi-eye]="!show" [class.bi-eye-slash]="show"></i>
                </button>
              </div>
              <div class="invalid-feedback d-block" *ngIf="f.submitted && !f.controls['password']?.valid">
                Mínimo de 6 caracteres.
              </div>
            </div>

            <button class="btn btn-primary w-100 mb-2" [disabled]="loading">
              <span *ngIf="!loading"><i class="bi bi-box-arrow-in-right me-1"></i> Entrar</span>
              <span *ngIf="loading">Entrando...</span>
            </button>

            <div class="text-center">
              <a routerLink="/auth/forgot" [queryParams]="{ email }" class="small text-decoration-none">
                Esqueceu a senha?
              </a>
            </div>

            <p *ngIf="msg" class="mt-3 mb-0" [class.text-danger]="error" [class.text-success]="!error">{{ msg }}</p>
          </form>

          <div class="text-center mt-3">
            <span class="text-secondary">Não tem conta?</span>
            <a routerLink="/auth/signup" [queryParams]="{ next: next }" class="ms-1">Cadastrar</a>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  show = false;
  loading = false;
  msg = '';
  error = false;

  next = this.route.snapshot.queryParamMap.get('next') || '/';

  async submit(f: NgForm) {
    if (f.invalid) return;
    this.loading = true; this.msg = ''; this.error = false;
    try {
      await this.auth.signIn(this.email, this.password);
      await this.router.navigateByUrl(this.next);
    } catch (e: any) {
      this.error = true;
      this.msg = e?.message || 'Falha ao entrar';
    } finally {
      this.loading = false;
    }
  }
}

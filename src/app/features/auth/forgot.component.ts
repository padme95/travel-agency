import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { supabase } from '../../core/supabase.client';

@Component({
  standalone: true,
  selector: 'app-forgot',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <section class="container auth-shell justify-content-center">
    <div class="w-100" style="max-width:480px">
      <div class="text-center mb-4">
        <h1 class="h3 fw-bold mb-1">Recuperar senha</h1>
        <p class="text-secondary mb-0">Informe seu e-mail para enviarmos o link</p>
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
              <div class="invalid-feedback">Informe um e-mail válido.</div>
            </div>

            <button class="btn btn-primary w-100" [disabled]="loading || cooldown > 0">
              <span *ngIf="!loading && cooldown === 0">
                <i class="bi bi-envelope-paper me-1"></i> Enviar link
              </span>
              <span *ngIf="loading">Enviando...</span>
              <span *ngIf="!loading && cooldown > 0">Reenviar em {{ cooldown }}s</span>
            </button>

            <p *ngIf="msg" class="mt-3 mb-0"
               [class.text-danger]="error"
               [class.text-success]="!error">{{ msg }}</p>

            <div class="form-text mt-2" *ngIf="!error && sentOnce">
              Dica: verifique a caixa de spam/lixo eletrônico. O remetente costuma ser o domínio do Supabase.
            </div>
          </form>

          <div class="text-center mt-3">
            <a routerLink="/auth/login" class="small">Voltar ao login</a>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
})
export class ForgotComponent {
  private route = inject(ActivatedRoute);

  email = (this.route.snapshot.queryParamMap.get('email') || '').trim();
  loading = false;
  msg = '';
  error = false;

  sentOnce = false;
  cooldown = 0;
  private cooldownTimer?: any;

  async submit(f: NgForm) {
    if (f.invalid || this.loading || this.cooldown > 0) return;


    this.email = this.email.trim().toLowerCase();

    this.loading = true;
    this.msg = '';
    this.error = false;

    try {
      const redirectTo = `${window.location.origin}/auth/reset`;
      const { error } = await supabase.auth.resetPasswordForEmail(this.email, { redirectTo });
      if (error) throw error;

      this.sentOnce = true;
      this.msg = 'Enviamos um link de recuperação para seu e-mail (verifique também a pasta de spam).';

      this.startCooldown(45);
    } catch (e: any) {
      this.error = true;
      const raw = (e?.message || '').toLowerCase();
      if (raw.includes('rate limit') || raw.includes('too many')) {
        this.msg = 'Muitos envios em pouco tempo. Tente novamente em instantes.';
        this.startCooldown(60);
      } else if (raw.includes('invalid email')) {
        this.msg = 'E-mail inválido. Verifique e tente novamente.';
      } else {
        this.msg = e?.message || 'Não foi possível enviar o link agora. Tente novamente em instantes.';
      }
    } finally {
      this.loading = false;
    }
  }

  private startCooldown(seconds: number) {
    this.cooldown = seconds;
    clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      this.cooldown--;
      if (this.cooldown <= 0) {
        clearInterval(this.cooldownTimer);
      }
    }, 1000);
  }
}

// src/app/features/auth/reset-password.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { supabase } from '../../core/supabase.client';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Definir nova senha</h2>
    <form (ngSubmit)="submit()">
      <label>Nova senha<br>
        <input [(ngModel)]="password" name="password" type="password" required minlength="6">
      </label><br><br>
      <button [disabled]="loading">{{ loading ? 'Atualizando...' : 'Salvar nova senha' }}</button>
      <p *ngIf="msg" [style.color]="err ? 'crimson' : '#14532d'">{{ msg }}</p>
    </form>
  `
})
export class ResetPasswordComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  password = '';
  loading = false;
  msg = '';
  err = false;

  async submit() {
    this.loading = true; this.msg = ''; this.err = false;
    try {
      const { error } = await supabase.auth.updateUser({ password: this.password });
      if (error) throw error;
      const next = this.route.snapshot.queryParamMap.get('next') || '/';
      this.msg = 'Senha atualizada! Faça login para continuar.';
      setTimeout(() => this.router.navigate(['/auth/login'], { queryParams: { next } }), 800);
    } catch (e: any) {
      this.msg = e?.message || 'Falha ao atualizar senha';
      this.err = true;
    } finally {
      this.loading = false;
    }
  }
}

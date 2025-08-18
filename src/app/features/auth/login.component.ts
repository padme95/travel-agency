// src/app/features/auth/login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h2>Entrar</h2>
    <form (ngSubmit)="submit()">
      <label>Email<br><input [(ngModel)]="email" name="email" type="email" required></label><br><br>
      <label>Senha<br><input [(ngModel)]="password" name="password" type="password" required></label><br><br>
      <button [disabled]="loading">{{ loading ? 'Entrando...' : 'Entrar' }}</button>
      <p *ngIf="msg" style="color:crimson">{{ msg }}</p>
    </form>
    <p>Não tem conta? <a routerLink="/auth/signup" [queryParams]="{ next: next }">Cadastrar</a></p>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = false;
  msg = '';

  // agora podemos ler 'route' aqui com segurança, pois 'inject' já inicializou
  next = this.route.snapshot.queryParamMap.get('next') || '/';

  async submit() {
    this.loading = true; this.msg = '';
    try {
      await this.auth.signIn(this.email, this.password);
      await this.router.navigateByUrl(this.next);
    } catch (e: any) {
      this.msg = e?.message || 'Falha ao entrar';
    } finally {
      this.loading = false;
    }
  }
}

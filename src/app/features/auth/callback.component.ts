// src/app/features/auth/callback.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-auth-callback',
  imports: [CommonModule],
  template: `<p>Redirecionando…</p>`
})
export class AuthCallbackComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    // Plano alternativo: não troca código por sessão.
    // Sinaliza na Home que o e-mail foi confirmado e peça login.
    const next = this.route.snapshot.queryParamMap.get('next') || '/';
    const target = '/'; // Home
    // Passa flags via query para a Home exibir o banner
    this.router.navigate([target], {
      queryParams: { m: 'confirmed', next }
    });
  }
}

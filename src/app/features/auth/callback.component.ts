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
    const next = this.route.snapshot.queryParamMap.get('next') || '/';
    const target = '/';
    this.router.navigate([target], {
      queryParams: { m: 'confirmed', next }
    });
  }
}

// src/app/core/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { supabase } from './supabase.client';

export const authGuard: CanActivateFn = async (_route, state) => {
  // ⬇️ injete tudo que precisar ANTES de qualquer await
  const router = inject(Router);

  // pode usar await depois que já injetou
  const { data } = await supabase.auth.getUser();

  return data.user
    ? true
    : router.createUrlTree(['/auth/login'], { queryParams: { next: state.url } });
};

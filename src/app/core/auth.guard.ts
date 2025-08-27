import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { supabase } from './supabase.client';

export const authGuard: CanActivateFn = async (_route, state) => {
  const router = inject(Router);

  const { data } = await supabase.auth.getUser();

  return data.user
    ? true
    : router.createUrlTree(['/auth/login'], { queryParams: { next: state.url } });
};

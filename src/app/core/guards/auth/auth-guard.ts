import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRole = route.data?.['role'];
  const userRole = authService.getRole();

  if (expectedRole && userRole !== expectedRole) {
    if (userRole === 'AGENTE') {
      router.navigate(['/agente']);
    } else if (userRole === 'ADMINISTRADOR') {
      router.navigate(['/admin']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  return true;
};
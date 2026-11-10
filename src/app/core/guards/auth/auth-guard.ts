import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificar si el usuario tiene un token activo
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRole = route.data?.['role'];
  const userRole = authService.getRole();

  // 2. Verificar si la ruta requiere un rol específico y si el usuario no lo tiene
  if (expectedRole && userRole !== expectedRole) {
    // 3. Redirigir según las nuevas etiquetas de rol del backend real
    if (userRole === 'USER') {
      router.navigate(['/agente']);
    } else if (userRole === 'ADMIN' || userRole === 'SUPERADMIN') {
      router.navigate(['/admin']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  return true;
};
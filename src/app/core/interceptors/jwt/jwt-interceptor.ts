import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Configuramos withCredentials para que el navegador envíe y reciba la cookie HttpOnly del refresh_token
  let authReq = req.clone({
    withCredentials: true
  });

  // Si existe un token de acceso, lo inyectamos en el encabezado
  if (token) {
    authReq = authReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq);
};
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/jwt/jwt-interceptor'; // Importa el interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Registramos el interceptor aquí
    provideHttpClient(withInterceptors([authInterceptor])) 
  ]
};
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthRequest, ApiResponse, AuthData } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  // Asegúrate de que environment.apiUrl apunte a la base de tu nuevo backend (ej. http://localhost:8080/api)
  private apiUrl = environment.apiUrl; 

  login(credentials: AuthRequest): Observable<AuthData> {
    // 1. Llamada POST al nuevo backend
    return this.http.post<ApiResponse<AuthData>>(`${this.apiUrl}/auth/login`, credentials).pipe(
      // 2. Extraemos la propiedad "data" del response global
      map(response => response.data),
      
      // 3. Procesamos los datos extraídos para guardarlos en localStorage
      tap((authData: AuthData) => {
        if (authData && authData.accessToken) {
          // Guardamos el JWT y la información básica del usuario
          localStorage.setItem('token', authData.accessToken);
          localStorage.setItem('role', authData.user.role);
          localStorage.setItem('userId', authData.user.id.toString());
          localStorage.setItem('userName', authData.user.name);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? Number(id) : null;
  }

  logout(): Observable<any> {
    // Llamada al endpoint real para invalidar la cookie refresh_token
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => this.limpiarSesionLocal()),
      catchError((err) => {
        console.error('Error al notificar el cierre de sesión al servidor', err);
        // Aunque el servidor falle (ej. sin conexión), limpiamos la sesión localmente
        this.limpiarSesionLocal();
        return of(null);
      })
    );
  }

  private limpiarSesionLocal(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
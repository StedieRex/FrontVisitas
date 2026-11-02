import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthRequest, AuthResponse } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.get<any[]>(`${this.apiUrl}/users?email=${credentials.email}`).pipe(
      map(users => {
        if (users && users.length > 0) {
          return {
            id: users[0].id, // <--- Capturamos el ID del usuario/agente
            token: users[0].token,
            role: users[0].role
          };
        }
        return {
          id: 2, // Fallback para Agente 1
          token: 'mock-agent-token',
          role: 'AGENTE'
        };
      }),
      tap((response: any) => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          if (response.id) {
            localStorage.setItem('userId', response.id.toString()); // <--- Guardamos el userId
          }
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

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId'); // <--- Limpiamos el userId al salir
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
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
            token: users[0].token,
            role: users[0].role
          };
        }
        // Rol por defecto si las credenciales no coinciden exactamente en mock
        return {
          token: 'mock-agent-token',
          role: 'AGENTE'
        };
      }),
      tap(response => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
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

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
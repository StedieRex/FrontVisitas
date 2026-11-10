import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          // Redirigir según el rol devuelto por el backend
          // Nota: El backend de producción usa SUPERADMIN/ADMIN/USER. 
          // Asegúrate de mapearlo correctamente a tus rutas.
          const role = response.user.role; 

          if (role === 'SUPERADMIN' || role === 'ADMIN' || role === 'ADMINISTRADOR') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/agente']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          // Manejo del error 401 y 429 especificados en la documentación
          if (err.status === 401) {
            this.errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
          } else if (err.status === 429) {
            this.errorMessage = 'Demasiados intentos fallidos. Por favor, espera 15 minutos.';
          } else {
            this.errorMessage = 'Ocurrió un error al intentar iniciar sesión.';
          }
          console.error('Error de login', err);
        }
      });
    }
  }
}
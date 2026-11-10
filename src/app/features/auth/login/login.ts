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
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // El rol viene directamente de response.user.role ("ADMIN" o "USER")
        const role = response.user.role; 

        if (role === 'ADMIN' || role === 'SUPERADMIN') {
          // Redirige al panel del administrador
          this.router.navigate(['/admin']);
        } else if (role === 'USER') {
          // Redirige al flujo del agente en campo
          this.router.navigate(['/agente']);
        } else {
          // Manejo por seguridad si llega un rol desconocido
          this.isLoading = false;
          this.errorMessage = 'Tu usuario no tiene un perfil válido asignado para ingresar.';
          this.authService.logout(); // Limpiamos la sesión por precaución
        }
      },
      error: (err) => {
        this.isLoading = false;
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
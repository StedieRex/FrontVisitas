import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VisitService } from '../../../core/services/visit/visit';
import { AuthService } from '../../../core/services/auth/auth';
import { VisitListDTO } from '../../../core/models/visit.model'; // Ajusta si no creaste el modelo

@Component({
  selector: 'app-visit-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visit-grid.html',
  styleUrl: './visit-grid.scss'
})
export class VisitGrid implements OnInit {
  visits: VisitListDTO[] = [];
  isLoading: boolean = true;

  constructor(
    private visitService: VisitService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarVisitas();
  }

  cargarVisitas() {
    this.visitService.getAdminVisits().subscribe({
      next: (data) => {
        this.visits = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar historial de visitas', err);
        this.isLoading = false;
      }
    });
  }

  verDetalle(visitId: number) {
    // Navegaremos a la pantalla de detalle pasando el ID en la URL
    this.router.navigate(['/admin/visita', visitId]);
  }

  logout() {
    this.authService.logout();
  }
}
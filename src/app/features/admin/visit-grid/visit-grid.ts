import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- Importante para [(ngModel)]
import { Router } from '@angular/router';
import { VisitService } from '../../../core/services/visit/visit';
import { AuthService } from '../../../core/services/auth/auth';
import { VisitListDTO } from '../../../core/models/visit.model';

@Component({
  selector: 'app-visit-grid',
  standalone: true,
  imports: [CommonModule, FormsModule], // <--- Se agrega FormsModule aquí
  templateUrl: './visit-grid.html',
  styleUrl: './visit-grid.scss'
})
export class VisitGrid implements OnInit {
  visits: VisitListDTO[] = [];
  filteredVisits: VisitListDTO[] = []; // Array que se mostrará en la tabla
  
  isLoading: boolean = true;
  startDate: string = '';
  endDate: string = '';

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
        this.filteredVisits = data; // Al inicio mostramos todas
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar historial de visitas', err);
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros() {
    this.filteredVisits = this.visits.filter(v => {
      // Obtenemos la fecha de la visita en milisegundos
      const visitTime = new Date(v.visitedAt).getTime();
      let pasaFiltro = true;

      if (this.startDate) {
        // Agregamos T00:00:00 para comparar desde el inicio de ese día
        const start = new Date(this.startDate + 'T00:00:00').getTime();
        if (visitTime < start) pasaFiltro = false;
      }

      if (this.endDate) {
        // Agregamos T23:59:59 para comparar hasta el final de ese día
        const end = new Date(this.endDate + 'T23:59:59').getTime();
        if (visitTime > end) pasaFiltro = false;
      }

      return pasaFiltro;
    });
  }

  limpiarFiltros() {
    this.startDate = '';
    this.endDate = '';
    this.filteredVisits = this.visits; // Restauramos la lista completa
  }

  verDetalle(id: number | undefined) {
    if (id) {
      this.router.navigate(['/admin/visita', id]);
    }
  }

  irAAsignacion() {
    this.router.navigate(['/admin/asignacion']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
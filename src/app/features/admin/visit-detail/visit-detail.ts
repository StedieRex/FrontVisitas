import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VisitService } from '../../../core/services/visit/visit';

@Component({
  selector: 'app-visit-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visit-detail.html',
  styleUrl: './visit-detail.scss'
})
export class VisitDetail implements OnInit {
  visit: any = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private visitService: VisitService
  ) {}

  ngOnInit() {
    // Extraemos el ID de la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDetalle(Number(id));
    }
  }

  cargarDetalle(id: number) {
    this.visitService.getVisitById(id).subscribe({
      next: (data) => {
        this.visit = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los detalles de la visita', err);
        this.isLoading = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/admin']);
  }
}
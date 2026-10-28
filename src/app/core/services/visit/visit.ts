import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { VisitListDTO } from '../../models/visit.model';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/visitas`;

  getVisits(): Observable<VisitListDTO[]> {
    return this.http.get<VisitListDTO[]>(this.apiUrl);
  }

  // Compatible con la llamada en VisitGrid
  getAdminVisits(): Observable<VisitListDTO[]> {
    return this.getVisits();
  }

  getVisitById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createVisit(visit: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, visit);
  }

  updateVisit(id: number | string, visit: Partial<VisitListDTO>): Observable<VisitListDTO> {
    return this.http.put<VisitListDTO>(`${this.apiUrl}/${id}`, visit);
  }

  deleteVisit(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Métodos requeridos por VisitForm
  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/clientes`);
  }

  getCatalogs(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/catalogos`);
  }

  uploadPhoto(visitId: number | string, file: File): Observable<any> {
    // Simula la subida exitosa de la foto en entorno mock
    return of({ success: true, message: 'Foto subida correctamente' });
  }
}
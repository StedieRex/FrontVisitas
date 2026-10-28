import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ClientActiveDTO } from '../../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private apiUrl = `${environment.apiUrl}/agentes`;

  constructor(private http: HttpClient) { }

  getClients(): Observable<ClientActiveDTO[]> {
    return this.http.get<ClientActiveDTO[]>(`${this.apiUrl}/clientes`);
  }

  // 1. Envía el JSON y devuelve el ID generado
  createVisit(visitData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/visitas`, visitData);
  }

  // 2. Envía la fotografía adjunta a la visita generada
  uploadPhoto(visitId: number, file: File): Observable<any> {
    const formData = new FormData();
    // Tu Java espera que el parámetro se llame 'file' según tu @RequestParam("file")
    formData.append('file', file); 
    return this.http.post(`${this.apiUrl}/visitas/${visitId}/fotos`, formData);
  }

  // Obtiene el historial completo para el administrador
  getAdminVisits(): Observable<any[]> {
    // Apuntamos a la ruta de admin definida en tu Spring Boot
    return this.http.get<any[]>(`${environment.apiUrl}/admin/visitas`);
  }

  // Obtiene el detalle de una visita específica
  getVisitById(visitId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/admin/visitas/${visitId}`);
  }

  getCatalogs(): Observable<any> {
    // Apuntamos explícitamente a la ruta global de catálogos
    return this.http.get<any>('http://localhost:8080/api/catalogos');
  }
}
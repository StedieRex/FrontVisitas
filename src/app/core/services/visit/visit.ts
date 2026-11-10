import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { VisitListDTO } from '../../models/visit.model';
import { ApiResponse } from '../../models/auth.model';

export interface CatalogItem {
  id: number;
  code: string;
  description: string;
}

export interface CatalogsData {
  actionCodes: CatalogItem[];
  visitResults: CatalogItem[];
  noPaymentReasons: CatalogItem[];
  addressTypes: CatalogItem[];
  portfolios: CatalogItem[];
}

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // ==========================================
  // 1. ENDPOINTS DE VISITAS (/visitas)
  // ==========================================
  getVisits(): Observable<VisitListDTO[]> {
    return this.http.get<VisitListDTO[]>(`${this.baseUrl}/visitas`);
  }
  
  getAdminVisits(): Observable<VisitListDTO[]> {
    return this.getVisits();
  }

  getVisitById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/visitas/${id}`);
  }

  createVisit(visit: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/visitas`, visit);
  }

  updateVisit(id: number | string, visit: Partial<VisitListDTO>): Observable<VisitListDTO> {
    return this.http.put<VisitListDTO>(`${this.baseUrl}/visitas/${id}`, visit);
  }

  deleteVisit(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/visitas/${id}`);
  }

  uploadPhoto(visitId: number | string, file: File): Observable<any> {
    // Simulación de subida de fotografía para json-server
    return of({ success: true, message: 'Fotografía adjuntada correctamente' });
  }

  // ==========================================
  // 2. ENDPOINTS DE CLIENTES (/clientes)
  // ==========================================
  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/clientes`);
  }

  getClientsByAgent(agentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/clientes?agentId=${agentId}`);
  }

  assignClientWithAuditData(clientData: any): Observable<any> {
    if (clientData.id) {
      return this.http.put(`${this.baseUrl}/clientes/${clientData.id}`, clientData);
    }
    return this.http.post(`${this.baseUrl}/clientes`, clientData);
  }

  // ==========================================
  // 3. ENDPOINTS DE USUARIOS Y AGENTES (/users)
  // ==========================================
  getAgents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users?role=AGENTE`);
  }

  // ==========================================
  // 4. ENDPOINTS DE CATÁLOGOS (/catalogos)
  // ==========================================
  getCatalogs(): Observable<CatalogsData> {
    // Definimos las 5 peticiones GET individuales hacia el nuevo backend
    const actionCodes$ = this.http.get<ApiResponse<CatalogItem[]>>(`${this.baseUrl}/action-codes`);
    const visitResults$ = this.http.get<ApiResponse<CatalogItem[]>>(`${this.baseUrl}/visit-results`);
    const noPaymentReasons$ = this.http.get<ApiResponse<CatalogItem[]>>(`${this.baseUrl}/no-payment-reasons`);
    const addressTypes$ = this.http.get<ApiResponse<CatalogItem[]>>(`${this.baseUrl}/address-types`);
    const portfolios$ = this.http.get<ApiResponse<CatalogItem[]>>(`${this.baseUrl}/portfolios`);

    // Usamos forkJoin para disparar las 5 llamadas en paralelo y esperar a que todas terminen
    return forkJoin([
      actionCodes$,
      visitResults$,
      noPaymentReasons$,
      addressTypes$,
      portfolios$
    ]).pipe(
      // Mapeamos el arreglo de respuestas globales extrayendo la propiedad .data de cada una
      map(([acRes, vrRes, npRes, atRes, pRes]) => {
        return {
          actionCodes: acRes.data,
          visitResults: vrRes.data,
          noPaymentReasons: npRes.data,
          addressTypes: atRes.data,
          portfolios: pRes.data
        };
      })
    );
  }
}
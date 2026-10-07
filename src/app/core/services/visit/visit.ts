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
}
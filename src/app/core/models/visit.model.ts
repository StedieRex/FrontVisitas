export interface VisitListDTO {
  id?: number; 
  visitId?: number;
  agentName?: string; // Opcional, dependiendo de si tu DTO lo incluye
  clientName: string;
  visitDate: string;
  result: string;
}
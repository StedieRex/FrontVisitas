import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VisitService } from '../../../core/services/visit/visit';

@Component({
  selector: 'app-agent-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-assignment.html'
})
export class AgentAssignment implements OnInit {
  agents: any[] = [];
  selectedAgentId: number | null = null;
  selectedFile: File | null = null;
  parsedClients: any[] = [];
  isProcessing = false;
  successMessage = '';
  errorMessage = '';

  constructor(private visitService: VisitService, private router: Router) {}

  ngOnInit() {
    this.cargarAgentes();
  }

  cargarAgentes() {
    this.visitService.getAgents().subscribe({
      next: (data) => this.agents = data,
      error: (err) => console.error('Error al cargar agentes:', err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      this.selectedFile = file;
      this.leerCSV(file);
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Por favor selecciona un archivo con formato .csv válido.';
      this.selectedFile = null;
      this.parsedClients = [];
    }
  }

  leerCSV(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      this.procesarContenidoCSV(text);
    };
    reader.readAsText(file);
  }

  procesarContenidoCSV(csvText: string) {
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2) {
      this.errorMessage = 'El archivo CSV está vacío o no contiene filas de datos.';
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const clients: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        // Construcción de la estructura DTO para el cliente y sus datos de auditoría
        // En agent-assignment.ts -> procesarContenidoCSV()
        clients.push({
          creditNumber: row.creditNumber,
          name: row.clientName,
          despacho: row.despacho,
          portfolio: row.portfolio,
          addresses: [
            {
              id: Date.now() + i,
              street: row.street,
              number: row.number,
              neighborhood: row.neighborhood,
              city: row.city,
              state: row.state,
              zipCode: row.zipCode
            }
          ]
          // NOTA: No incluimos "clientId: 101" para evitar IDs duplicados
        });
      }
    }

    this.parsedClients = clients;
  }

  onSubmitAssignment() {
    if (!this.selectedAgentId) {
      this.errorMessage = 'Debes seleccionar un agente.';
      return;
    }
    if (this.parsedClients.length === 0) {
      this.errorMessage = 'Debes cargar un archivo CSV con datos válidos.';
      return;
    }

    this.isProcessing = true;
    let guardados = 0;

    // Asignar el ID del agente seleccionado a cada cliente procesado del CSV
    this.parsedClients.forEach(client => {
      client.agentId = Number(this.selectedAgentId);

      this.visitService.assignClientWithAuditData(client).subscribe({
        next: () => {
          guardados++;
          if (guardados === this.parsedClients.length) {
            this.isProcessing = false;
            this.successMessage = `¡Se asignaron exitosamente ${guardados} cliente(s) con sus datos de auditoría!`;
            this.resetForm();
          }
        },
        error: (err) => {
          console.error('Error al guardar cliente:', err);
          this.isProcessing = false;
          this.errorMessage = 'Error al registrar los clientes en el sistema.';
        }
      });
    });
  }

  resetForm() {
    this.selectedAgentId = null;
    this.selectedFile = null;
    this.parsedClients = [];
  }

  volver() {
    this.router.navigate(['/admin']);
  }
}
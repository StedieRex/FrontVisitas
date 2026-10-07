import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VisitService } from '../../../core/services/visit/visit'; 
import { AuthService } from '../../../core/services/auth/auth'; 
import { ClientActiveDTO, AddressDTO } from '../../../core/models/client.model';

@Component({
  selector: 'app-visit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './visit-form.html',
  styleUrl: './visit-form.scss'
})
export class VisitForm implements OnInit {
  visitForm: FormGroup;
  clients: ClientActiveDTO[] = [];
  availableAddresses: AddressDTO[] = [];

  constructor(
    private fb: FormBuilder, 
    private visitService: VisitService,
    private authService: AuthService
  ) {
    this.visitForm = this.fb.group({
      clientId: ['', Validators.required],
      addressId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.visitService.getClients().subscribe({
      next: (data: any) => {
        this.clients = data;
      },
      error: (err: any) => {
        console.error('Error al cargar clientes', err);
      }
    });
  }

  onClientChange(event: any) {
    const selectedClientId = Number(event.target.value);
    const selectedClient = this.clients.find(c => c.clientId === selectedClientId);
    
    if (selectedClient) {
      this.availableAddresses = selectedClient.addresses;
    } else {
      this.availableAddresses = [];
    }
    
    this.visitForm.get('addressId')?.setValue('');
  }

  logout() {
    this.authService.logout();
  }
}

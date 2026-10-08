import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('fileInput') fileInput!: ElementRef;
  visitForm: FormGroup;
  clients: ClientActiveDTO[] = [];
  availableAddresses: AddressDTO[] = [];
  
  selectedFile: File | null = null;
  isSubmitting: boolean = false;
  successMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private visitService: VisitService,
    private authService: AuthService
  ) {
    // Formulario ampliado con todos los campos del JSON
    this.visitForm = this.fb.group({
      clientId: ['', Validators.required],
      addressId: ['', Validators.required],
      actionCodeId: [1, Validators.required],
      resultId: [7, Validators.required],
      noPaymentReasonId: [null],
      attendedBy: ['', Validators.required],
      kinship: ['', Validators.required],
      comments: ['', Validators.required],
      propertyDescription: ['', Validators.required],
      businessActivity: ['', Validators.required],
      isOperating: ['NO_APLICA', Validators.required],
      // Subgrupo para la promesa de pago
      paymentPromise: this.fb.group({
        amount: [null],
        promisedDate: ['']
      })
    });
  }

  ngOnInit() {
    this.visitService.getClients().subscribe({
      next: (data: any) => { this.clients = data; },
      error: (err: any) => { console.error('Error al cargar clientes', err); }
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

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (this.visitForm.valid) {
      this.isSubmitting = true;
      this.successMessage = '';

      // Construimos el DTO con la estructura exacta que pide el backend
      const formValues = this.visitForm.value;
      const visitRequestDTO = {
        clientId: Number(formValues.clientId),
        addressId: Number(formValues.addressId),
        actionCodeId: Number(formValues.actionCodeId),
        resultId: Number(formValues.resultId),
        noPaymentReasonId: formValues.noPaymentReasonId ? Number(formValues.noPaymentReasonId) : null,
        attendedBy: formValues.attendedBy,
        kinship: formValues.kinship,
        comments: formValues.comments,
        propertyDescription: formValues.propertyDescription,
        businessActivity: formValues.businessActivity,
        isOperating: formValues.isOperating,
        paymentPromise: formValues.paymentPromise.amount ? {
          amount: Number(formValues.paymentPromise.amount),
          promisedDate: formValues.paymentPromise.promisedDate
        } : null
      };

      this.visitService.createVisit(visitRequestDTO).subscribe({
        next: (response: any) => {
          if (this.selectedFile && response.visitId) {
            this.visitService.uploadPhoto(response.visitId, this.selectedFile).subscribe({
              next: () => this.finalizarFormulario(),
              error: (err) => {
                console.error('Error al subir foto', err);
                alert('La visita se guardó, pero hubo un error al subir la foto.');
                this.isSubmitting = false;
              }
            });
          } else {
            this.finalizarFormulario();
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error al guardar la visita', err);
          alert('Hubo un error al registrar la visita.');
        }
      });
    }
  }

  private finalizarFormulario() {
    this.isSubmitting = false;
    this.successMessage = '¡Visita registrada correctamente!';
    this.visitForm.reset({
      actionCodeId: 1,
      resultId: 7,
      isOperating: 'NO_APLICA'
    });
    this.selectedFile = null;
    this.availableAddresses = [];
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    
    setTimeout(() => this.successMessage = '', 3000);
  }

  logout() {
    this.authService.logout();
  }
}
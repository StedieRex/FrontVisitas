import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // 1. IMPORTAR ROUTER
import { VisitService } from '../../../core/services/visit/visit'; 
import { AuthService } from '../../../core/services/auth/auth'; 

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
  
  // Catálogos y Datos
  clients: any[] = [];
  selectedClient: any = null;
  availableAddresses: any[] = [];
  
  actionCodes: any[] = [];
  visitResults: any[] = [];
  noPaymentReasons: any[] = [];
  addressTypes: any[] = [];
  portfolios: any[] = [];

  selectedFile: File | null = null;
  isSubmitting = false;
  successMessage = '';

  // 2. INYECTAR ROUTER EN EL CONSTRUCTOR
  constructor(
    private fb: FormBuilder, 
    private visitService: VisitService, 
    private authService: AuthService,
    private router: Router
  ) {
    this.visitForm = this.fb.group({
      clientId: ['', Validators.required],
      addressId: [''], // Dirección específica del cliente
      visitDate: ['', Validators.required],
      addressTypeId: ['', Validators.required],
      attendedBy: ['', Validators.required],
      actionCodeId: ['', Validators.required],
      resultId: ['', Validators.required],
      noPaymentReasonId: [''],
      promiseDate: [''],
      promiseAmount: [''],
      comments: ['', Validators.required],
      businessActivity: [''],
      isOperating: ['SI'],
      latitude: [{value: '', disabled: true}],
      longitude: [{value: '', disabled: true}],
      additionalContactName: [''],
      additionalContactPhone: [''],
      additionalContactEmail: ['']
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // 1. Cargar Clientes
    this.visitService.getClients().subscribe(data => this.clients = data);

    // 2. Cargar Catálogos con Logs
    this.visitService.getCatalogs().subscribe({
      next: (data) => {
        console.log('✅ Catálogos recibidos del backend:', data);
        this.actionCodes = data.actionCodes;
        this.visitResults = data.visitResults;
        this.noPaymentReasons = data.noPaymentReasons;
        this.addressTypes = data.addressTypes;
        this.portfolios = data.portfolios;
      },
      error: (err) => {
        console.error('❌ Error al pedir los catálogos:', err);
      }
    });
  }

 onClientChange(event: any) {
  const selectedClientId = Number(event.target.value);
  this.selectedClient = this.clients.find(c => (c.clientId || c.id) === selectedClientId);
  
  if (this.selectedClient) {
    this.availableAddresses = this.selectedClient.addresses || [this.selectedClient];
    
    // Autoasignamos el ID de la dirección disponible al control del formulario
    const firstAddress = this.availableAddresses[0];
    if (firstAddress) {
      this.visitForm.patchValue({
        addressId: firstAddress.id || firstAddress.addressId || selectedClientId
      });
    }
  } else {
    this.availableAddresses = [];
    this.visitForm.get('addressId')?.setValue('');
  }
}

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  obtenerUbicacion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.visitForm.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          alert('Error al obtener la ubicación GPS.');
          console.error(error);
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  }

  onSubmit() {
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting = true;
    this.successMessage = '';
    const formValues = this.visitForm.getRawValue();

    console.log('Datos completos del formulario:', formValues);
    console.log(JSON.stringify(formValues, null, 2));

    // Mapeo exacto hacia tu Backend
    const visitRequestDTO = {
      clientId: Number(formValues.clientId),
      addressId: Number(formValues.addressId),
      addressTypeId: Number(formValues.addressTypeId),
      actionCodeId: Number(formValues.actionCodeId),
      resultId: Number(formValues.resultId),
      noPaymentReasonId: formValues.noPaymentReasonId ? Number(formValues.noPaymentReasonId) : null,
      attendedBy: formValues.attendedBy,
      comments: formValues.comments,
      businessActivity: formValues.businessActivity,
      isOperating: formValues.isOperating,
      visitedAt: formValues.visitDate, // Mapeado a visitedAt si tu backend lo espera así
      latitude: formValues.latitude,
      longitude: formValues.longitude,
      additionalContactName: formValues.additionalContactName,
      additionalContactPhone: formValues.additionalContactPhone,
      additionalContactEmail: formValues.additionalContactEmail,
      paymentPromise: formValues.promiseAmount ? {
        amount: Number(formValues.promiseAmount),
        promisedDate: formValues.promiseDate
      } : null
    };

    this.visitService.createVisit(visitRequestDTO).subscribe({
      next: (response: any) => {
        if (this.selectedFile && (response.visitId || response.id)) {
          const id = response.visitId || response.id;
          this.visitService.uploadPhoto(id, this.selectedFile).subscribe({
            next: () => this.finalizarFormulario(),
            error: (err) => {
              console.error('Error al subir foto', err);
              alert('La visita se guardó, pero hubo un error con la foto.');
              this.finalizarFormulario();
            }
          });
        } else {
          this.finalizarFormulario();
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error al guardar', err);
        alert('Hubo un error al registrar la visita.');
      }
    });
  }

  private finalizarFormulario() {
    this.isSubmitting = false;
    this.successMessage = '¡Visita registrada exitosamente!';
    this.visitForm.reset({
      isOperating: 'SI'
    });
    this.selectedClient = null;
    this.selectedFile = null;
    this.availableAddresses = [];
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    
    setTimeout(() => this.successMessage = '', 4000);
  }

  // 3. ACTUALIZAR LOGOUT PARA REDIRIGIR A LOGIN
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
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
    // 1. Obtener el ID del agente que inició sesión (fallback a 2 si no existe)
    const agentId = this.authService.getUserId() || 2; 

    console.log('🔍 Cargando clientes asignados para el agentId:', agentId);

    // 2. Cargar Clientes filtrados por ese Agente
    this.visitService.getClientsByAgent(agentId).subscribe({
      next: (data) => {
        console.log('✅ Clientes asignados recibidos:', data);
        this.clients = data;
      },
      error: (err) => {
        console.error('❌ Error al obtener clientes del agente:', err);
      }
    });

    // 3. Cargar Catálogos
    this.visitService.getCatalogs().subscribe({
      next: (data) => {
        this.actionCodes = data.actionCodes;
        this.visitResults = data.visitResults;
        this.noPaymentReasons = data.noPaymentReasons;
        this.addressTypes = data.addressTypes;
        this.portfolios = data.portfolios;
      },
      error: (err) => console.error('❌ Error al pedir catálogos:', err)
    });
  }

  onClientChange(event: any) {
    const selectedId = event.target.value;
    
    // Comparamos convirtiendo a String para soportar IDs alfanuméricos ("IEuxvvUXZQA") y numéricos ("1")
    this.selectedClient = this.clients.find(c => String(c.id) === String(selectedId));

    if (this.selectedClient) {
      // Asignamos los domicilios correspondientes al cliente seleccionado
      this.availableAddresses = this.selectedClient.addresses || [];
      
      // Autoasignamos el ID de la primera dirección disponible
      const firstAddress = this.availableAddresses[0];
      if (firstAddress) {
        this.visitForm.patchValue({
          addressId: firstAddress.id || 1
        });
      } else {
        this.visitForm.get('addressId')?.setValue('');
      }
    } else {
      this.selectedClient = null;
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

  rellenadoRapido() {
    // 1. Si no hay cliente seleccionado, auto-seleccionamos el primero de la lista
    if (!this.visitForm.get('clientId')?.value && this.clients.length > 0) {
      const primerCliente = this.clients[0];
      this.visitForm.patchValue({ clientId: primerCliente.id });
      
      // Disparamos manualmente el cambio para que cargue las direcciones
      this.onClientChange({ target: { value: primerCliente.id } });
    }

    // 2. Generamos fechas de prueba (Hoy y Mañana)
    const hoy = new Date();
    // Formato datetime-local: YYYY-MM-DDThh:mm
    const strHoy = new Date(hoy.getTime() - (hoy.getTimezoneOffset() * 60000)).toISOString().slice(0, 16); 
    
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    const strManana = manana.toISOString().split('T')[0]; // Formato date: YYYY-MM-DD

    // 3. Inyectamos los datos al formulario ignorando latitud, longitud y archivo fotográfico
    this.visitForm.patchValue({
      visitDate: strHoy,
      addressTypeId: this.addressTypes.length > 0 ? this.addressTypes[0].id : '',
      attendedBy: 'Familiar del titular (Prueba)',
      actionCodeId: this.actionCodes.length > 0 ? this.actionCodes[0].id : '',
      resultId: this.visitResults.length > 0 ? this.visitResults[0].id : '',
      noPaymentReasonId: this.noPaymentReasons.length > 0 ? this.noPaymentReasons[0].id : '',
      promiseAmount: 2500.50,
      promiseDate: strManana,
      comments: 'Visita de prueba generada automáticamente mediante rellenado rápido. Todo en orden.',
      businessActivity: 'Comercio General / Abarrotes',
      isOperating: 'SI',
      additionalContactName: 'Contacto de Prueba',
      additionalContactPhone: '2221234567',
      additionalContactEmail: 'prueba@correo.com'
    });
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
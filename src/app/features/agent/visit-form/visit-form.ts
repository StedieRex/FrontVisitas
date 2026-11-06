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

  photoPreview: string | null = null;

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

  async obtenerUbicacion() {
    if (!navigator.geolocation) {
    alert('Tu dispositivo o navegador no soporta la geolocalización.');
    return;
    }

    // 1. Verificar proactivamente el estado del permiso
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'denied') {
          alert('❌ El acceso al GPS está bloqueado.\n\nPara solucionarlo: Toca el icono de candado o configuración junto a la barra de direcciones de tu navegador, elige "Permisos", habilita la "Ubicación" y vuelve a intentarlo.');
          return; // Detenemos la ejecución porque sabemos que fallará
        }
      }
    } catch (error) {
      console.warn('El navegador no soporta la API de Permisos, continuando...', error);
    }

    // 2. Si no está denegado, solicitamos la ubicación (esto lanza el prompt si está en estado 'prompt')
    console.log('Solicitando ubicación... el navegador preguntará si es necesario.');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Éxito: Guardamos las coordenadas en el formulario
        this.visitForm.patchValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        console.log('Ubicación exitosa:', position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        // Manejo de errores en caso de que lo deniegue en ese instante o falle el hardware
        let mensaje = 'Error desconocido al intentar conectar con el GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          mensaje = 'Cancelaste el permiso de ubicación. Es obligatorio para continuar.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          mensaje = 'No se pudo obtener señal GPS. Comprueba que la "Ubicación" esté encendida en los ajustes rápidos de tu teléfono.';
        } else if (error.code === error.TIMEOUT) {
          mensaje = 'Se agotó el tiempo esperando la señal GPS. Intenta ponerte cerca de una ventana o al aire libre.';
        }
        alert(mensaje);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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

  // 3. ACTUALIZAR LOGOUT PARA REDIRIGIR A LOGIN
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Actualiza tu método onFileChange existente:
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      // 1. Extraemos el archivo en una constante local (TypeScript ahora sabe que existe sí o sí)
      const file = event.target.files[0];
      
      // 2. Lo asignamos a la variable de la clase para enviarlo al backend luego
      this.selectedFile = file;
      
      // 3. Generamos la previsualización usando la constante local
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file); 
    }
  }

  // NUEVO MÉTODO para descartar la foto
  quitarFoto() {
    this.selectedFile = null;
    this.photoPreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Actualiza tu método finalizarFormulario para limpiar la previsualización tras el guardado
  private finalizarFormulario() {
    this.isSubmitting = false;
    this.successMessage = '¡Visita registrada exitosamente!';
    this.visitForm.reset({
      isOperating: 'SI'
    });
    this.selectedClient = null;
    this.selectedFile = null;
    this.photoPreview = null; // Limpiar la imagen mostrada
    this.availableAddresses = [];
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    
    setTimeout(() => this.successMessage = '', 4000);
  }


}
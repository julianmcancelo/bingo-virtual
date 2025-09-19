import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PerfilService } from '../../services/perfil.service';
import { environment } from 'src/environments/environment';
import { Usuario } from '../../../../models/usuario.model';
import { AuthService, Usuario as AuthUser } from '../../../../core/services/auth.service';
import { Subscription, first } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { AvatarService } from '../../../../services/avatar.service';

@Component({
  selector: 'app-perfil-page',
  templateUrl: './perfil-page.component.html',
  styleUrls: ['./perfil-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSelectModule,
    MatProgressBarModule,
    MatDividerModule,
    MatSnackBarModule
  ]
})
export class PerfilPageComponent implements OnInit, OnDestroy {
  perfilForm: FormGroup;
  usuario: Usuario | null = null;
  cargando = true;
  editando = false;
  selectedTab = 0;

  // Lista de avatares predefinidos
  avatares: string[] = [];

  // Variable para controlar si el usuario tiene redes sociales
  tieneRedesSociales = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private authService: AuthService,
    private avatarService: AvatarService,
    private snackBar: MatSnackBar
  ) {
    this.perfilForm = this.fb.group({
      apodo: ['', [
        Validators.minLength(3),
        Validators.maxLength(30)
      ]],
      biografia: ['', [
        Validators.maxLength(500)
      ]],
      facebook_url: ['', [this.validateUrl.bind(this)]],
      twitter_url: ['', [this.validateUrl.bind(this)]],
      instagram_url: ['', [this.validateUrl.bind(this)]],
      linkedin_url: ['', [this.validateUrl.bind(this)]],
      es_perfil_publico: [true]
    });
  }

  ngOnInit(): void {
    this.loadAvatares();
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const authSub = this.authService.currentUser$.subscribe({
      next: (user: AuthUser | null) => {
        if (user) {
          // Ensure we have a valid date
          let fechaCreacion: Date;
          try {
            fechaCreacion = user.fechaCreacion ? new Date(user.fechaCreacion) : new Date();
            if (isNaN(fechaCreacion.getTime())) {
              fechaCreacion = new Date();
            }
          } catch (e) {
            fechaCreacion = new Date();
          }

          // Set initial user data from auth service
          const initialUser: Usuario = {
            id: parseInt(user.id, 10),
            nombre_usuario: user.nombre || 'Usuario',
            email: user.email,
            creado_en: fechaCreacion,
            es_perfil_publico: true,
            avatar_url: user.avatar || 'default-avatar.png',
            // Add other required fields with default values
            apodo: '',
            biografia: '',
            facebook_url: '',
            twitter_url: '',
            instagram_url: '',
            linkedin_url: ''
          };
          
          this.usuario = initialUser;
          this.actualizarFormulario(initialUser);
        }
        // Always try to load the full profile
        this.loadUserProfile();
      },
      error: (error) => {
        console.error('Error al cargar el usuario actual:', error);
        this.loadUserProfile(); // Still try to load profile
      }
    });
    this.subscriptions.add(authSub);
  }

  // Helper method to safely access user properties
  private getSafeUserValue<T>(value: T | undefined | null, defaultValue: T): T {
    return value !== undefined && value !== null ? value : defaultValue;
  }

  // Lista de avatares predefinidos
  public predefinedAvatars = [
    '16.png', 
    'lightning.png', 
    'noctis.png', 
    'rinoa.png', 
    'squall.png',
    'firion.png',
    'jill.png',
    'sephirot.png',
    'default-avatar.png'
  ];
  
  // Propiedad para el progreso de carga
  public uploadProgress = 0;
  
  // Avatar actualmente seleccionado
  public selectedAvatar: string | null = null;
  
  // Tipos de archivo permitidos
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  /**
   * Obtiene la URL completa del avatar
   * @returns string URL completa del avatar
   */
  getAvatarUrl(): string {
    if (!this.usuario || !this.usuario.avatar_url) {
      return this.avatarService.getAvatarUrl('');
    }

    const avatarUrl = this.usuario.avatar_url;
    console.log('Obteniendo URL para avatar:', avatarUrl);
    
    // Si ya es una URL completa, la devolvemos tal cual
    if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:')) {
      return avatarUrl;
    }

    // Extraemos solo el nombre del archivo
    const fileName = avatarUrl.split('/').pop() || avatarUrl;
    console.log('Nombre de archivo extraído:', fileName);

    // Verificamos si es un avatar predefinido
    const isPredefined = this.predefinedAvatars.includes(fileName) || 
                        (this.usuario as any).is_predefined;
    
    console.log('¿Es un avatar predefinido?', isPredefined, 'fileName:', fileName);

    if (isPredefined) {
      // Para avatares predefinidos, usamos la ruta de assets
      // Aseguramos que no se duplique la ruta /assets/avatars/
      const cleanFileName = fileName.replace(/^.*[\\/]/, '');
      const url = `/assets/avatars/${cleanFileName}`;
      console.log('URL de avatar predefinido:', url);
      return url;
    }

    // Si el archivo ya tiene una ruta completa, la usamos
    if (avatarUrl.includes('/') || avatarUrl.includes('\\')) {
      // Si ya tiene la ruta completa, la devolvemos tal cual
      if (avatarUrl.startsWith('http') || avatarUrl.startsWith('/')) {
        return avatarUrl;
      }
      // Si es una ruta relativa completa, la convertimos a absoluta
      return `/${avatarUrl}`;
    }

    // Para avatares personalizados, usamos la ruta del servidor
    const baseUrl = environment.serverUrl || 'http://localhost:3000';
    const url = `${baseUrl}/uploads/avatars/${fileName}`;
    console.log('URL de avatar personalizado:', url);
    return url;
  }
  
  // Cargar la lista de avatares disponibles
  private loadAvatares(): void {
    try {
      // Usamos los avatares predefinidos
      this.avatares = [...this.predefinedAvatars];
      console.log('Avatares predefinidos cargados:', this.avatares);
      
      // Si el usuario ya tiene un avatar seleccionado, marcarlo como seleccionado
      if (this.usuario?.avatar_url) {
        const currentAvatar = this.usuario.avatar_url.split('/').pop() || '';
        if (this.predefinedAvatars.includes(currentAvatar)) {
          this.selectedAvatar = currentAvatar;
        }
      }
    } catch (error) {
      console.error('Error al cargar los avatares:', error);
      this.avatares = [];
    }
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'Fecha desconocida';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
      }
      
      // Format the date using locale settings
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha inválida';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadUserProfile(): void {
    this.cargando = true;

    const profileSub = this.perfilService.obtenerMiPerfil()
      .pipe(first())
      .subscribe({
        next: (usuario: Usuario) => {
          if (usuario) {
            // Si el backend devuelve datos, actualizamos el usuario
            const updatedUser: Usuario = {
              ...(this.usuario || {}),
              ...usuario,
              // Asegurarse de que los campos requeridos tengan un valor por defecto
              id: usuario.id || (this.usuario?.id || 0),
              nombre_usuario: usuario.nombre_usuario || (this.usuario?.nombre_usuario || 'Usuario'),
              email: usuario.email || (this.usuario?.email || ''),
              creado_en: usuario.creado_en || (this.usuario?.creado_en || new Date()),
              // Asegurar que los campos opcionales tengan un valor por defecto
              apodo: usuario.apodo || '',
              biografia: usuario.biografia || '',
              avatar_url: usuario.avatar_url || 'default-avatar.png',
              es_perfil_publico: usuario.es_perfil_publico ?? true,
              facebook_url: usuario.facebook_url || '',
              twitter_url: usuario.twitter_url || '',
              instagram_url: usuario.instagram_url || '',
              linkedin_url: usuario.linkedin_url || ''
            };
            
            this.usuario = updatedUser;
            this.actualizarFormulario(updatedUser);
            this.updateSocialMediaPresence();
          }
          this.cargando = false;
        },
        error: (error: any) => {
          console.error('Error al cargar el perfil:', error);
          this.mostrarError('Error al cargar el perfil. Usando datos básicos de la sesión.');
          this.cargando = false;
        }
      });

    this.subscriptions.add(profileSub);
  }

  private updateSocialMediaPresence(): void {
    this.tieneRedesSociales = !!(
      this.usuario?.facebook_url ||
      this.usuario?.twitter_url ||
      this.usuario?.instagram_url ||
      this.usuario?.linkedin_url
    );
  }

  public actualizarFormulario(usuario: Usuario): void {
    if (!usuario) return;

    this.perfilForm.patchValue({
      apodo: usuario.apodo || '',
      biografia: usuario.biografia || '',
      facebook_url: usuario.facebook_url || '',
      twitter_url: usuario.twitter_url || '',
      instagram_url: usuario.instagram_url || '',
      linkedin_url: usuario.linkedin_url || '',
      es_perfil_publico: usuario.es_perfil_publico ?? true
    });
  }

  public guardarCambios(): void {
    if (this.perfilForm.invalid) {
      this.mostrarError('Por favor, completa el formulario correctamente');
      return;
    }

    this.cargando = true;
    const formValue = this.perfilForm.value;

    // Prepare updated data (remove empty strings)
    const datosActualizados: Partial<Usuario> = Object.entries(formValue).reduce<Partial<Usuario>>((acc, [key, value]) => {
      acc[key as keyof Usuario] = value === '' ? null : value as any;
      return acc;
    }, {});

    const updateSub = this.perfilService.actualizarPerfil(datosActualizados)
      .pipe(first())
      .subscribe({
        next: () => {
          this.mostrarMensaje('Perfil actualizado correctamente');
          this.editando = false;
          this.loadUserProfile(); // Reload user data
        },
        error: (error: any) => {
          console.error('Error al actualizar el perfil:', error);
          this.mostrarError('Error al actualizar el perfil. Por favor, inténtalo de nuevo.');
          this.cargando = false;
        }
      });

    this.subscriptions.add(updateSub);
  }

  /**
   * Maneja la selección de un avatar de la lista de avatares predefinidos
   * @param avatarFileName Nombre del archivo del avatar seleccionado
   */
  public seleccionarAvatar(avatarFileName: string): void {
    if (!avatarFileName) {
      this.mostrarError('No se ha seleccionado ningún avatar');
      return;
    }

    this.cargando = true;
    
    // Extraer solo el nombre del archivo (sin ruta)
    const fileName = avatarFileName.split('/').pop() || avatarFileName;
    const isPredefined = this.predefinedAvatars.includes(fileName);
    this.selectedAvatar = fileName; // Guardar solo el nombre del archivo
    
    console.log('Actualizando avatar:', { 
      original: avatarFileName, 
      fileName,
      isPredefined
    });
    
    // Llamar al servicio para actualizar el avatar en el servidor
    const avatarSub = this.perfilService.actualizarAvatar(fileName)
      .pipe(first())
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta del servidor al actualizar avatar:', response);
          
          if (this.usuario) {
            // Usar frontend_avatar_url si está disponible, de lo contrario usar avatar_url o el nombre del archivo
            const avatarToStore = response.frontend_avatar_url || response.avatar_url || fileName;
            
            // Actualizar la URL del avatar en el objeto de usuario
            this.usuario.avatar_url = fileName; // Guardar solo el nombre del archivo
            
            // Marcar como predefinido si corresponde
            if (isPredefined || response.is_predefined) {
              (this.usuario as any).is_predefined = true;
            }
            
            console.log('Nuevo avatar almacenado:', {
              avatar_url: fileName,
              is_predefined: isPredefined || response.is_predefined,
              response: response
            });
            
            // Actualizar el usuario en el servicio de autenticación
            if (this.authService.updateUserAvatar) {
              this.authService.updateUserAvatar(avatarToStore);
            }
            
            // Actualizar el usuario en el almacenamiento local
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser) {
              currentUser.avatar_url = fileName; // Guardar solo el nombre del archivo
              if (isPredefined || response.is_predefined) {
                currentUser.is_predefined = true;
              }
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            
            // Forzar la actualización de la vista
            this.usuario = { ...this.usuario };
          }
          
          this.mostrarMensaje('Avatar actualizado correctamente');
          this.cargando = false;
        },
        error: (error: any) => {
          console.error('Error al actualizar el avatar:', error);
          let errorMessage = 'Error al actualizar el avatar. Por favor, intenta de nuevo.';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.mostrarError(errorMessage);
          this.cargando = false;
        }
      });

    this.subscriptions.add(avatarSub);
  }

  private validateUrl(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    try {
      new URL(control.value);
      return null;
    } catch (e) {
      return { invalidUrl: true };
    }
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['mensaje-exito'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  /**
   * Maneja la selección de un archivo para el avatar
   * @param event Evento de selección de archivo
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (!file) {
      return;
    }
    
    // Validar tipo de archivo
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.mostrarError('Formato de archivo no soportado. Usa JPG, PNG o GIF.');
      return;
    }
    
    // Validar tamaño del archivo
    if (file.size > this.MAX_FILE_SIZE) {
      this.mostrarError('El archivo es demasiado grande. El tamaño máximo es 2MB.');
      return;
    }
    
    // Configurar el progreso
    this.uploadProgress = 0;
    this.cargando = true;
    
    // Crear un objeto FormData para enviar el archivo
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Llamar al servicio para subir el archivo
    const uploadSub = this.perfilService.actualizarAvatar(file)
      .pipe(first())
      .subscribe({
        next: (response) => {
          console.log('Avatar subido exitosamente:', response);
          
          if (this.usuario) {
            // Actualizar la URL del avatar
            this.usuario.avatar_url = response.avatar_url;
            
            // Actualizar el usuario en el servicio de autenticación
            this.authService.updateUserAvatar(response.avatar_url);
            
            // Forzar la actualización de la vista
            this.usuario = { ...this.usuario };
          }
          
          this.mostrarMensaje('Avatar actualizado correctamente');
        },
        error: (error) => {
          console.error('Error al subir el avatar:', error);
          let errorMessage = 'Error al subir el avatar. Por favor, inténtalo de nuevo.';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.mostrarError(errorMessage);
        },
        complete: () => {
          this.cargando = false;
          this.uploadProgress = 0;
        }
      });
    
    this.subscriptions.add(uploadSub);
  }
}

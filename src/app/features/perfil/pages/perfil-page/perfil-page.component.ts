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

  // Cargar la lista de avatares disponibles
  private loadAvatares(): void {
    const avataresSub = this.avatarService.loadAvatars().subscribe({
      next: (avatars) => {
        this.avatares = avatars;
      },
      error: (error) => {
        console.error('Error al cargar los avatares:', error);
        // Si hay un error, usamos una lista por defecto
        this.avatares = [
          '16.png',
          'lightning.png',
          'noctis.png',
          'rinoa.png',
          'squall.png'
        ];
      }
    });
    
    this.subscriptions.add(avataresSub);
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
          if (usuario && this.usuario) {
            // Si el backend devuelve datos, actualizamos el usuario
            const updatedUser: Usuario = {
              ...this.usuario,
              ...usuario,
              id: usuario.id || this.usuario.id,
              nombre_usuario: usuario.nombre_usuario || this.usuario.nombre_usuario,
              email: usuario.email || this.usuario.email,
              creado_en: usuario.creado_en || this.usuario.creado_en
            };
            this.usuario = updatedUser;
            this.actualizarFormulario(updatedUser);
            this.updateSocialMediaPresence();
          } else if (usuario) {
            // Si no hay usuario actual pero sí datos del perfil
            this.usuario = usuario;
            this.actualizarFormulario(usuario);
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

  public seleccionarAvatar(avatarFileName: string): void {
    if (!avatarFileName) {
      this.mostrarError('No se ha seleccionado ningún avatar');
      return;
    }

    this.cargando = true;

    // Obtener solo el nombre del archivo
    const fileName = avatarFileName.split('/').pop() || avatarFileName;
    
    console.log('Intentando actualizar avatar con archivo:', fileName);
    
    // Llamar al servicio para actualizar el avatar
    const avatarSub = this.perfilService.actualizarAvatar(fileName)
      .pipe(first())
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor al actualizar avatar:', response);
          
          if (this.usuario) {
            // Actualizar la URL del avatar con la devuelta por el servidor
            this.usuario.avatar_url = response.avatar_url || `assets/avatars/${fileName}`;
            
            // También actualizar el servicio de autenticación
            this.authService.updateUserAvatar(this.usuario.avatar_url);
            
            // Forzar la actualización de la vista
            this.usuario = { ...this.usuario };
            
            // Mostrar la nueva imagen del avatar
            console.log('Avatar actualizado:', this.getAvatarUrl());
          }
          
          this.mostrarMensaje('Avatar actualizado correctamente');
          this.cargando = false;
        },
        error: (error: any) => {
          console.error('Error al actualizar el avatar:', error);
          let errorMessage = 'Error al actualizar el avatar. Por favor, intenta de nuevo.';
          
          if (error.error && error.error.message) {
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
      panelClass: ['error-snackbar']
    });
  }

  // Obtiene la URL completa del avatar
  getAvatarUrl(): string {
    if (!this.usuario || !this.usuario.avatar_url) {
      return this.avatarService.getAvatarUrl('');
    }
    
    console.log('Obteniendo URL del avatar:', this.usuario.avatar_url);
    
    // Si la URL del avatar ya es una URL completa, la devolvemos tal cual
    if (this.usuario.avatar_url.startsWith('http') || this.usuario.avatar_url.startsWith('data:')) {
      return this.usuario.avatar_url;
    }
    
    // Si la URL del avatar empieza con /uploads/avatars/, construimos la URL completa
    if (this.usuario.avatar_url.startsWith('/uploads/avatars/')) {
      // Obtener solo el nombre del archivo
      const fileName = this.usuario.avatar_url.split('/').pop() || '';
      
      // Si estamos en desarrollo, usamos la ruta relativa al servidor local
      if (environment.production) {
        return `${environment.serverUrl}${this.usuario.avatar_url}`;
      } else {
        // En desarrollo, asumimos que los avatares están en assets/avatars
        return `assets/avatars/${fileName}`;
      }
    }
    
    // Para cualquier otro caso, usar el servicio de avatar
    return this.avatarService.getAvatarUrl(this.usuario.avatar_url);
  }
}

/**
 * COMPONENTE DE LOGIN
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Componente standalone para autenticación con formularios reactivos
 * 
 * COMPLEJIDAD TEMPORAL: O(1) - Validaciones y operaciones constantes
 * COMPLEJIDAD ESPACIAL: O(1) - Almacenamiento constante de formulario
 * 
 * PATRONES IMPLEMENTADOS:
 * - Reactive Forms: Formularios reactivos con validaciones
 * - Observer Pattern: EventEmitter para comunicación con componente padre
 * - Validator Pattern: Validaciones personalizadas
 */

import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VersionService } from '../../services/version.service';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  @Output() loginComoInvitado = new EventEmitter<string>();
  
  /**
   * FORMULARIO REACTIVO PARA LOGIN
   * 
   * @description Uso de FormBuilder para crear formulario con validaciones
   */
  loginForm!: FormGroup;
  loginUserForm!: FormGroup;
  registerForm!: FormGroup;

  // Modo de la tarjeta: 'guest' (invitado), 'signin' (iniciar sesión), 'register' (crear cuenta)
  mode: 'guest' | 'signin' | 'register' = 'guest';
  // Estado de autenticación (para mostrar bienvenida si ya hay sesión)
  isAuthenticated = false;
  currentUserEmail = '';
  currentUserName = '';
  currentUserId: number | null = null;

  // Métricas locales del jugador (futuro: persistir en servidor)
  victorias = 0;
  derrotas = 0;
  lineasCompletas = 0;

  constructor(
    private fb: FormBuilder,
    public versionService: VersionService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * INICIALIZACIÓN DEL COMPONENTE
   * 
   * @complexity O(1) - Inicialización constante del formulario
   */
  ngOnInit(): void {
    this.initializeForm();
    // Suscribirse al estado de autenticación para adaptar la UI
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUserEmail = user?.email || '';
      this.currentUserName = user?.nombre_usuario || '';
      this.currentUserId = (user as any)?.id ?? null;
      // Si hay sesión, cargar métricas locales
      if (this.isAuthenticated) {
        this.cargarMetricasUsuario();
      }
      // Si ya está autenticado, quedamos en modo invitado pero mostrando bienvenida (UI superior)
    });

    // Leer el query param 'mode' para abrir el panel correspondiente directamente
    // Admite valores: 'signin' | 'register' | 'guest'
    this.route.queryParamMap.subscribe(params => {
      const qpMode = (params.get('mode') || 'guest') as 'guest' | 'signin' | 'register';
      if (!this.isAuthenticated) {
        this.mode = qpMode;
      }
    });
  }

  /**
   * Carga métricas del usuario desde localStorage si existen.
   * Clave: stats_<userId> -> { victorias, derrotas, lineasCompletas }
   */
  private cargarMetricasUsuario(): void {
    try {
      if (!this.currentUserId) return;
      const raw = localStorage.getItem(`stats_${this.currentUserId}`);
      if (!raw) return;
      const stats = JSON.parse(raw);
      this.victorias = Number(stats?.victorias || 0);
      this.derrotas = Number(stats?.derrotas || 0);
      this.lineasCompletas = Number(stats?.lineasCompletas || 0);
    } catch {
      // Ignorar errores de parseo
    }
  }

  /**
   * INICIALIZAR FORMULARIO REACTIVO
   * 
   * @complexity O(1) - Configuración constante de validadores
   */
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      nombreJugador: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/) // Solo letras, números, guiones y guiones bajos
      ]]
    });

    // Inline login form
    this.loginUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Inline register form
    this.registerForm = this.fb.group({
      nombre_usuario: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)
      ]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmar_contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * INICIAR COMO INVITADO
   * 
   * @complexity O(1) - Validación y emisión constante
   */
  iniciarComoInvitado(): void {
    if (this.loginForm.valid) {
      const nombreJugador = this.loginForm.get('nombreJugador')?.value;
      this.loginComoInvitado.emit(nombreJugador);
    } else {
      this.markFormGroupTouched();
      this.showValidationErrors();
    }
  }

  // Cambiar modo a "Iniciar sesión"
  openLogin(): void {
    if (this.isAuthenticated) return; // Ya autenticado, no corresponde
    this.mode = 'signin';
  }

  openRegister(): void {
    if (this.isAuthenticated) return; // Ya autenticado, no corresponde
    this.mode = 'register';
  }

  closeAuthPanels(): void {
    // Volver al modo invitado (tarjeta original)
    this.mode = 'guest';
  }

  // Submit inline login
  submitLoginUser(): void {
    if (this.loginUserForm.invalid) {
      this.loginUserForm.markAllAsTouched();
      return;
    }
    const { email, contrasena } = this.loginUserForm.value;
    this.authService.login(email, contrasena).subscribe({
      next: () => {
        // AuthService ya navega a /bingo; restablecemos el modo por consistencia
        this.mode = 'guest';
      },
      error: (err) => {
        const msg = err?.error?.mensaje || 'Error al iniciar sesión';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  // Submit inline register
  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const { nombre_usuario, email, contrasena, confirmar_contrasena } = this.registerForm.value;
    if (contrasena !== confirmar_contrasena) {
      Swal.fire('Datos inválidos', 'Las contraseñas no coinciden', 'warning');
      return;
    }
    this.authService.register(nombre_usuario, email, contrasena, confirmar_contrasena).subscribe({
      next: () => {
        // Usuario queda logueado por AuthService.register; navegamos a /bingo
        this.router.navigateByUrl('/bingo');
        this.mode = 'guest';
      },
      error: (err) => {
        const msg = err?.error?.mensaje || 'Error al registrarse';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  /**
   * Ir al Lobby cuando ya hay sesión iniciada
   * Útil para mostrar un CTA cuando el usuario vuelve a esta pantalla autenticado.
   */
  irAlLobby(): void {
    this.router.navigateByUrl('/bingo');
  }

  /**
   * MARCAR TODOS LOS CAMPOS COMO TOCADOS
   * 
   * @complexity O(n) donde n = número de campos del formulario
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * MOSTRAR ERRORES DE VALIDACIÓN
   * 
   * @complexity O(1) - Verificación constante de errores
   */
  private showValidationErrors(): void {
    const nombreControl = this.loginForm.get('nombreJugador');
    
    if (nombreControl?.errors) {
      let errorMessage = 'Error en el nombre de jugador:\n';
      
      if (nombreControl.errors['required']) {
        errorMessage += '• El nombre es obligatorio\n';
      }
      if (nombreControl.errors['minlength']) {
        errorMessage += '• Mínimo 3 caracteres\n';
      }
      if (nombreControl.errors['maxlength']) {
        errorMessage += '• Máximo 20 caracteres\n';
      }
      if (nombreControl.errors['pattern']) {
        errorMessage += '• Solo letras, números, guiones y guiones bajos\n';
      }

      Swal.fire({
        title: 'Datos inválidos',
        text: errorMessage,
        icon: 'warning',
        confirmButtonColor: 'var(--itb-accent-blue)',
        confirmButtonText: 'Entendido'
      });
    }
  }

  /**
   * OBTENER MENSAJE DE ERROR PARA CAMPO
   * 
   * @param fieldName - Nombre del campo
   * @returns string - Mensaje de error o cadena vacía
   * 
   * @complexity O(1) - Verificación constante de errores
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.errors && field?.touched) {
      if (field.errors['required']) return 'Este campo es obligatorio';
      if (field.errors['minlength']) return 'Mínimo 3 caracteres';
      if (field.errors['maxlength']) return 'Máximo 20 caracteres';
      if (field.errors['pattern']) return 'Solo letras, números, - y _';
    }
    
    return '';
  }

  /**
   * VERIFICAR SI CAMPO TIENE ERROR
   * 
   * @param fieldName - Nombre del campo
   * @returns boolean - true si tiene error
   * 
   * @complexity O(1) - Verificación constante
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.errors && field?.touched);
  }

  /**
   * FUNCIÓN PLACEHOLDER PARA CARACTERÍSTICAS FUTURAS
   * 
   * @complexity O(1) - Mostrar modal constante
   */
  proximamente(): void {
    Swal.fire('Próximamente', 'Esta funcionalidad estará disponible en una futura actualización.', 'info');
  }

  showChangelog(): void {
    this.versionService.showChangelogModal();
  }
}

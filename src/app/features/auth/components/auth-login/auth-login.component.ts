/**
 * COMPONENTE DE AUTENTICACIÓN - LOGIN
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Componente standalone para login con roles y autenticación completa
 * 
 * COMPLEJIDAD TEMPORAL: O(1) - Validaciones y operaciones de login constantes
 * COMPLEJIDAD ESPACIAL: O(1) - Almacenamiento constante de formulario
 * 
 * PATRONES IMPLEMENTADOS:
 * - Reactive Forms: Formularios reactivos con validaciones avanzadas
 * - Observer Pattern: Suscripción a cambios de autenticación
 * - Strategy Pattern: Diferentes estrategias de login (admin, player, etc.)
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AuthService, LoginCredentials } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <mat-card class="w-full max-w-md">
        <mat-card-header class="text-center pb-4">
          <mat-card-title class="text-2xl font-bold text-gray-800">
            Iniciar Sesión
          </mat-card-title>
          <mat-card-subtitle class="text-gray-600">
            Accede con tu cuenta de bingo virtual
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <input 
                matInput 
                type="email" 
                formControlName="email"
                placeholder="usuario@ejemplo.com">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="hasFieldError('email')">
                {{ getFieldError('email') }}
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Contraseña</mat-label>
              <input 
                matInput 
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                placeholder="Tu contraseña">
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="hasFieldError('password')">
                {{ getFieldError('password') }}
              </mat-error>
            </mat-form-field>

            <div class="pt-4">
              <button 
                mat-raised-button 
                color="primary"
                type="submit"
                class="w-full py-2"
                [disabled]="!loginForm.valid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20" class="mr-2"></mat-spinner>
                {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
              </button>
            </div>
          </form>

          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-semibold text-gray-700 mb-2">Usuarios de prueba:</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="font-medium">Admin:</span>
                <span class="text-gray-600">admin&#64;bingo.com / admin123</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Jugador:</span>
                <span class="text-gray-600">player&#64;bingo.com / player123</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Moderador:</span>
                <span class="text-gray-600">moderator&#64;bingo.com / mod123</span>
              </div>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions class="flex justify-between p-4">
          <button mat-button (click)="goToBingo()" color="accent">
            <mat-icon>arrow_back</mat-icon>
            Volver al Bingo
          </button>
          <button mat-button disabled>
            ¿Olvidaste tu contraseña?
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
    
    mat-card {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border-radius: 16px;
    }
    
    .space-y-4 > * + * {
      margin-top: 1rem;
    }
  `]
})
export class AuthLoginComponent implements OnInit, OnDestroy {
  
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  /**
   * INICIALIZACIÓN DEL COMPONENTE
   * 
   * @complexity O(1) - Configuración inicial constante
   */
  ngOnInit(): void {
    this.initializeForm();
    this.checkExistingAuth();
  }

  /**
   * LIMPIEZA AL DESTRUIR COMPONENTE
   * 
   * @complexity O(1) - Limpieza constante
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * INICIALIZAR FORMULARIO REACTIVO
   * 
   * @complexity O(1) - Configuración constante de validadores
   */
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  /**
   * VERIFICAR AUTENTICACIÓN EXISTENTE
   * 
   * @complexity O(1) - Verificación constante
   */
  private checkExistingAuth(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/bingo']);
    }
  }

  /**
   * PROCESAR ENVÍO DEL FORMULARIO
   * 
   * @complexity O(1) - Procesamiento constante
   */
  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const credentials: LoginCredentials = this.loginForm.value;
      
      this.subscription.add(
        this.authService.login(credentials).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.snackBar.open(
              `¡Bienvenido ${response.user.nombre}!`, 
              'Cerrar', 
              { duration: 3000 }
            );
            this.router.navigate(['/bingo']);
          },
          error: (error) => {
            this.isLoading = false;
            this.snackBar.open(
              error.message || 'Error al iniciar sesión', 
              'Cerrar', 
              { duration: 5000 }
            );
          }
        })
      );
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * NAVEGAR AL BINGO PRINCIPAL
   * 
   * @complexity O(1) - Navegación constante
   */
  goToBingo(): void {
    this.router.navigate(['/bingo']);
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
   * OBTENER MENSAJE DE ERROR PARA CAMPO
   * 
   * @param fieldName - Nombre del campo
   * @returns string - Mensaje de error
   * 
   * @complexity O(1) - Verificación constante de errores
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.errors && field?.touched) {
      if (field.errors['required']) return 'Este campo es obligatorio';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return 'Mínimo 6 caracteres';
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
}

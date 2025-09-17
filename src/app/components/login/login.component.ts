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

  constructor(
    private fb: FormBuilder,
    public versionService: VersionService
  ) {}

  /**
   * INICIALIZACIÓN DEL COMPONENTE
   * 
   * @complexity O(1) - Inicialización constante del formulario
   */
  ngOnInit(): void {
    this.initializeForm();
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

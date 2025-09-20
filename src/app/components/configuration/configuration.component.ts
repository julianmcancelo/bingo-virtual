/**
 * CONFIGURATION COMPONENT - Configuración de la aplicación
 *
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Componente para configurar parámetros de la aplicación
 *
 * @complejidad O(1) - Operaciones constantes para configuración
 */
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';

// Import the SettingsService and AppSettings interface
import { SettingsService, AppSettings } from '../../services/settings.service';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatOptionModule
  ],
  template: `
    <div class="configuration-container p-6">
      <mat-card class="max-w-2xl mx-auto">
        <mat-card-header>
          <mat-card-title class="text-2xl font-bold text-gray-800">
            ⚙️ Configuración del Sistema
          </mat-card-title>
          <mat-card-subtitle class="text-gray-600">
            Ajusta los parámetros de Bingo Virtual
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="mt-4">
          <form [formGroup]="configForm" (ngSubmit)="onSubmit()" class="space-y-6">

            <!-- Configuración General -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-blue-600">Configuración General</h3>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Nombre del Jugador</mat-label>
                <input matInput formControlName="playerName" placeholder="Ingresa tu nombre">
                <mat-error *ngIf="configForm.get('playerName')?.hasError('required')">
                  El nombre es requerido
                </mat-error>
                <mat-error *ngIf="configForm.get('playerName')?.hasError('minlength')">
                  Mínimo 2 caracteres
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Idioma</mat-label>
                <mat-select formControlName="language">
                  <mat-option value="es">Español</mat-option>
                  <mat-option value="en">English</mat-option>
                  <mat-option value="pt">Português</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Configuración de Juego -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-green-600">Configuración de Juego</h3>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Tiempo por turno (segundos)</mat-label>
                <input matInput type="number" formControlName="turnTime"
                       min="10" max="120">
                <mat-error *ngIf="configForm.get('turnTime')?.hasError('required')">
                  Tiempo requerido
                </mat-error>
                <mat-error *ngIf="configForm.get('turnTime')?.hasError('min')">
                  Mínimo 10 segundos
                </mat-error>
                <mat-error *ngIf="configForm.get('turnTime')?.hasError('max')">
                  Máximo 120 segundos
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Volumen de efectos (0-100)</mat-label>
                <input matInput type="number" formControlName="soundVolume"
                       min="0" max="100">
                <mat-error *ngIf="configForm.get('soundVolume')?.hasError('min')">
                  Mínimo 0
                </mat-error>
                <mat-error *ngIf="configForm.get('soundVolume')?.hasError('max')">
                  Máximo 100
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Configuración de Interfaz -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-purple-600">Configuración de Interfaz</h3>

              <div class="flex items-center space-x-4">
                <mat-slide-toggle formControlName="darkMode">
                  Modo Oscuro
                </mat-slide-toggle>
                <mat-slide-toggle formControlName="animations">
                  Animaciones
                </mat-slide-toggle>
                <mat-slide-toggle formControlName="notifications">
                  Notificaciones
                </mat-slide-toggle>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="flex justify-between pt-4">
              <button mat-raised-button color="warn" type="button" (click)="resetToDefaults()">
                <mat-icon>restore</mat-icon>
                Restaurar Predeterminados
              </button>

              <button mat-raised-button color="primary" type="submit"
                      [disabled]="!configForm.valid">
                <mat-icon>save</mat-icon>
                Guardar Configuración
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .configuration-container {
      min-height: calc(100vh - 200px);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    mat-card {
      margin-top: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    mat-form-field {
      width: 100%;
    }

    .space-y-4 > * + * {
      margin-top: 1rem;
    }

    .space-y-6 > * + * {
      margin-top: 1.5rem;
    }
  `]
})
export class ConfigurationComponent implements OnInit, OnDestroy {
  // Suscripción a cambios de configuración
  private settingsSubscription: Subscription | undefined;

  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private snackBar = inject(MatSnackBar);

  configForm!: FormGroup;

  ngOnInit() {
    this.initializeForm();
    this.loadCurrentSettings();
    
    // Suscribirse a cambios en la configuración
    this.settingsSubscription = this.settingsService.settings$.subscribe(settings => {
      // Actualizar el formulario cuando cambie la configuración
      this.configForm.patchValue({
        playerName: settings.playerName,
        language: settings.language,
        turnTime: settings.turnTime,
        soundVolume: settings.soundVolume,
        darkMode: settings.darkMode,
        animations: settings.animations,
        notifications: settings.notifications
      }, { emitEvent: false });
    });
  }
  
  /**
   * DESTRUCTOR DEL COMPONENTE
   * 
   * @description Limpia las suscripciones para evitar memory leaks.
   */
  ngOnDestroy() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
  
  /**
   * APLICAR TEMA
   * 
   * @description Aplica el tema claro/oscuro según la configuración.
   * @param {boolean} isDarkMode - Indica si el modo oscuro está activado.
   */
  private applyTheme(isDarkMode: boolean): void {
    const body = document.body;
    if (isDarkMode) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }

  private initializeForm(): void {
    this.configForm = this.fb.group({
      playerName: ['', [Validators.required, Validators.minLength(2)]],
      language: ['es', Validators.required],
      turnTime: [30, [Validators.required, Validators.min(10), Validators.max(120)]],
      soundVolume: [75, [Validators.required, Validators.min(0), Validators.max(100)]],
      darkMode: [false],
      animations: [true],
      notifications: [true]
    });
  }

  /**
   * CARGAR CONFIGURACIÓN ACTUAL
   * 
   * @description Carga la configuración actual del servicio y actualiza el formulario.
   * Maneja errores y proporciona valores por defecto si es necesario.
   */
  private loadCurrentSettings(): void {
    try {
      const currentSettings = this.settingsService.getSettings();
      
      // Asegurarse de que todos los campos requeridos estén presentes
      const settings = {
        playerName: currentSettings.playerName || 'Jugador',
        language: currentSettings.language || 'es',
        turnTime: currentSettings.turnTime || 30,
        soundVolume: currentSettings.soundVolume || 75,
        darkMode: currentSettings.darkMode ?? false,
        animations: currentSettings.animations ?? true,
        notifications: currentSettings.notifications ?? true
      };

      this.configForm.patchValue(settings);
      
      // Aplicar configuración de tema
      this.applyTheme(settings.darkMode);
      
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      this.snackBar.open('❌ Error al cargar la configuración', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * MANEJADOR DE ENVÍO DEL FORMULARIO
   * 
   * @description Maneja el envío del formulario de configuración.
   * Valida los datos y los guarda a través del servicio.
   */
  onSubmit(): void {
    if (this.configForm.invalid) {
      this.snackBar.open('❌ Por favor, completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const formValue = this.configForm.value as AppSettings;
      
      // Aplicar configuración
      this.settingsService.saveSettings(formValue);
      this.applyTheme(formValue.darkMode);
      
      // Mostrar confirmación
      this.snackBar.open('✅ Configuración guardada correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      
      console.log('Configuración guardada:', formValue);
      
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      this.snackBar.open('❌ Error al guardar la configuración', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * RESTAURAR CONFIGURACIÓN PREDETERMINADA
   * 
   * @description Restaura la configuración a los valores por defecto
   * y actualiza el formulario.
   */
  resetToDefaults(): void {
    try {
      // Obtener valores por defecto del servicio
      const defaultSettings = this.settingsService.getCurrentSettings();
      
      // Actualizar el formulario con los valores por defecto
      this.configForm.patchValue({
        playerName: defaultSettings.playerName,
        language: defaultSettings.language,
        turnTime: defaultSettings.turnTime,
        soundVolume: defaultSettings.soundVolume,
        darkMode: defaultSettings.darkMode,
        animations: defaultSettings.animations,
        notifications: defaultSettings.notifications
      });
      
      // Aplicar tema predeterminado
      this.applyTheme(defaultSettings.darkMode);
      
      // Mostrar confirmación
      this.snackBar.open('🔄 Configuración restaurada a valores predeterminados', 'Cerrar', {
        duration: 3000
      });
      
    } catch (error) {
      console.error('Error al restaurar configuración predeterminada:', error);
      this.snackBar.open('❌ Error al restaurar configuración predeterminada', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
}

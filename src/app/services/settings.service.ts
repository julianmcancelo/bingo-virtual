import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * INTERFAZ DE CONFIGURACIÓN COMPLETA DE LA APLICACIÓN
 * 
 * @description Define todas las opciones personalizables de la aplicación.
 */
export interface AppSettings {
  /** Nombre del jugador, mínimo 2 caracteres */
  playerName: string;
  
  /** Código de idioma (es, en, pt) */
  language: 'es' | 'en' | 'pt';
  
  /** Tiempo por turno en segundos (10-120) */
  turnTime: number;
  
  /** Volumen de efectos de sonido (0-100) */
  soundVolume: number;
  
  /** Indica si el modo oscuro está activado */
  darkMode: boolean;
  
  /** Indica si las animaciones están habilitadas */
  animations: boolean;
  
  /** Indica si las notificaciones están habilitadas */
  notifications: boolean;
  
  /** Indica si el marcado automático está activado */
  marcadoAutomatico: boolean;
  
  /** Indica si el narrador está habilitado */
  narradorHabilitado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  /**
   * ESTADO INICIAL DE LA CONFIGURACIÓN COMPLETA
   * 
   * @description Valores por defecto para todas las opciones de la aplicación.
   */
  private readonly defaultSettings: AppSettings = {
    playerName: 'Jugador',
    language: 'es',
    turnTime: 30,
    soundVolume: 75,
    darkMode: false,
    animations: true,
    notifications: true,
    marcadoAutomatico: false,
    narradorHabilitado: true,
  };

  // BehaviorSubject para mantener el estado reactivo de la configuración
  private settingsSubject = new BehaviorSubject<AppSettings>(this.defaultSettings);

  // Observable público para que los componentes se suscriban a los cambios
  public settings$ = this.settingsSubject.asObservable();

  constructor() {
    this.initializeSettings();
  }

  /**
   * INICIALIZAR CONFIGURACIÓN
   * 
   * @description Carga la configuración guardada o usa los valores por defecto.
   */
  private initializeSettings(): void {
    try {
      const savedSettings = localStorage.getItem('bingo-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings) as Partial<AppSettings>;
        // Asegurar que todos los campos tengan valores válidos
        const settings = { ...this.defaultSettings, ...parsedSettings };
        this.settingsSubject.next(settings);
      } else {
        // Guardar configuración por defecto si no existe
        this.saveSettings(this.defaultSettings);
      }
    } catch (error) {
      console.error('[SettingsService] Error al cargar configuración:', error);
      // En caso de error, usar valores por defecto
      this.settingsSubject.next(this.defaultSettings);
    }
  }

  /**
   * OBTENER CONFIGURACIÓN ACTUAL
   * 
   * @description Devuelve el valor actual de la configuración.
   * @returns {AppSettings} El objeto de configuración actual.
   */
  getCurrentSettings(): AppSettings {
    return this.settingsSubject.getValue();
  }

  /**
   * OBTENER CONFIGURACIÓN (MÉTODO DE COMPATIBILIDAD)
   * 
   * @description Alias para getCurrentSettings() para compatibilidad.
   * @returns {AppSettings} El objeto de configuración actual.
   */
  getSettings(): AppSettings {
    return this.getCurrentSettings();
  }

  /**
   * GUARDAR CONFIGURACIÓN
   * 
   * @description Guarda la configuración en localStorage y actualiza el estado reactivo.
   * @param {AppSettings} settings - La configuración completa a guardar.
   */
  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem('bingo-settings', JSON.stringify(settings));
      this.settingsSubject.next(settings);
      console.log('[SettingsService] Configuración guardada:', settings);
    } catch (error: any) {
      console.error('[SettingsService] Error guardando configuración:', error);
    }
  }

  /**
   * ACTUALIZAR CONFIGURACIÓN
   * 
   * @description Actualiza una o más propiedades de la configuración y notifica a los suscriptores.
   * @param {Partial<AppSettings>} newSettings - Un objeto con las propiedades a actualizar.
   */
  /**
   * ACTUALIZAR CONFIGURACIÓN
   * 
   * @description Actualiza una o más propiedades de la configuración, guarda en localStorage
   * y notifica a los suscriptores.
   * @param {Partial<AppSettings>} newSettings - Un objeto con las propiedades a actualizar.
   */
  updateSettings(newSettings: Partial<AppSettings>): void {
    try {
      const currentSettings = this.getCurrentSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      
      // Validar los valores actualizados
      if (updatedSettings.turnTime < 10 || updatedSettings.turnTime > 120) {
        throw new Error('Tiempo de turno inválido');
      }
      
      if (updatedSettings.soundVolume < 0 || updatedSettings.soundVolume > 100) {
        throw new Error('Volumen de sonido inválido');
      }
      
      // Guardar en localStorage y actualizar estado
      this.saveSettings(updatedSettings);
      console.log('[SettingsService] Configuración actualizada:', updatedSettings);
    } catch (error) {
      console.error('[SettingsService] Error al actualizar configuración:', error);
      throw error; // Relanzar para manejar el error en el componente
    }
  }
}

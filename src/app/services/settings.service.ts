import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * INTERFAZ DE CONFIGURACIÓN DEL JUEGO
 * 
 * @description Define la estructura de las opciones personalizables por el usuario.
 */
export interface GameSettings {
  marcadoAutomatico: boolean;
  narradorHabilitado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  /**
   * ESTADO INICIAL DE LA CONFIGURACIÓN
   * 
   * @description Valores por defecto para las opciones del juego.
   */
  private readonly defaultSettings: GameSettings = {
    marcadoAutomatico: false,
    narradorHabilitado: true,
  };

  // BehaviorSubject para mantener el estado reactivo de la configuración
  private settingsSubject = new BehaviorSubject<GameSettings>(this.defaultSettings);

  // Observable público para que los componentes se suscriban a los cambios
  public settings$ = this.settingsSubject.asObservable();

  constructor() { }

  /**
   * OBTENER CONFIGURACIÓN ACTUAL
   * 
   * @description Devuelve el valor actual de la configuración.
   * @returns {GameSettings} El objeto de configuración actual.
   */
  getCurrentSettings(): GameSettings {
    return this.settingsSubject.getValue();
  }

  /**
   * ACTUALIZAR CONFIGURACIÓN
   * 
   * @description Actualiza una o más propiedades de la configuración y notifica a los suscriptores.
   * @param {Partial<GameSettings>} newSettings - Un objeto con las propiedades a actualizar.
   */
  updateSettings(newSettings: Partial<GameSettings>): void {
    const currentSettings = this.getCurrentSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    this.settingsSubject.next(updatedSettings);
    console.log('[SettingsService] Configuración actualizada:', updatedSettings);
  }
}

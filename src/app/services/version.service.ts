/**
 * Universidad Nacional de La Plata - Facultad de Informática
 * Algoritmos y Estructuras de Datos III (ALED3) - 2024
 * 
 * Trabajo Final: Bingo Virtual Educativo
 * 
 * Autores:
 * - Julián Manuel Cancelo
 * - Nicolás Otero
 * 
 * Profesor: Sebastián Saldivar
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  
  // Versión actual de la aplicación
  private readonly version = '1.2.0';
  private readonly buildDate = '2024-09-16';
  private readonly appName = 'Bingo Virtual Educativo';

  constructor() { }

  /**
   * Obtiene la versión actual de la aplicación
   * @returns string - Versión en formato semántico (x.y.z)
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Obtiene la fecha de compilación
   * @returns string - Fecha en formato YYYY-MM-DD
   */
  getBuildDate(): string {
    return this.buildDate;
  }

  /**
   * Obtiene el nombre completo de la aplicación
   * @returns string - Nombre de la aplicación
   */
  getAppName(): string {
    return this.appName;
  }

  /**
   * Obtiene información completa de la versión
   * @returns object - Objeto con toda la información de versión
   */
  getVersionInfo() {
    return {
      version: this.version,
      buildDate: this.buildDate,
      appName: this.appName,
      fullVersion: `${this.appName} v${this.version} (${this.buildDate})`
    };
  }

  /**
   * Obtiene la versión formateada para mostrar
   * @returns string - Versión formateada
   */
  getFormattedVersion(): string {
    return `v${this.version}`;
  }
}

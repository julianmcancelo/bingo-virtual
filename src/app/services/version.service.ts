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
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  
  // Versión actual de la aplicación
  private readonly version = '2.1.1';
  private readonly buildDate = '2024-09-18';
  private readonly appName = 'Bingo Virtual Educativo';
  private readonly dbVersion = '1.1.0';

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
   * @returns objeto con toda la información de versión
   */
  getVersionInfo() {
    return {
      version: this.version,
      buildDate: this.buildDate,
      appName: this.appName
    };
  }

  /**
   * Obtiene el changelog completo de la aplicación
   * @returns array con el historial de versiones y cambios
   */
  getChangelog() {
    return [
      {
        version: '2.1.0',
        date: '2024-09-18',
        title: 'Sistema de Niveles y Experiencia',
        changes: [
          'Implementación de sistema de niveles progresivos',
          'Experiencia (XP) por acciones en el juego',
          'Ranking de jugadores',
          'Visualización de nivel y progreso en el perfil'
        ]
      },
      {
        version: '2.0.0',
        date: '2024-09-17',
        title: 'Integración con MySQL y Autenticación',
        changes: [
          'Migración a base de datos MySQL para persistencia de datos',
          'Sistema de autenticación de usuarios con JWT',
          'Perfiles de usuario y gestión de cuentas'
        ]
      },
      {
        version: '1.3.2',
        date: '2024-09-17',
        title: 'Mejoras en la Interfaz',
        changes: [
          'Rediseño del campo de texto en pantalla de login',
          'Mejora en la experiencia de usuario del formulario de inicio de sesión',
          'Ajustes en los estilos de los campos de formulario'
        ]
      },
      {
        version: '1.3.1',
        date: '2024-09-16',
        title: 'Corrección de Errores',
        changes: [
          'Corregido error en botón "Volver al Lobby" del componente sala',
          'Solucionado problema de método inexistente onVolverAlLobby()',
          'Mejorada estabilidad de la navegación entre componentes'
        ]
      },
      {
        version: '1.3.0',
        date: '2024-09-16',
        title: 'Diseño Mejorado del Cartón',
        changes: [
          'Rediseño completo del cartón de bingo con gradientes modernos',
          'Animaciones mejoradas para números marcados',
          'Contador de progreso en tiempo real',
          'Mejor feedback visual para hover y selección',
          'Optimización responsive mantenida'
        ]
      },
      {
        version: '1.2.0',
        date: '2024-09-16',
        title: 'Chat Reposicionado y Lobby',
        changes: [
          'Chat flotante reposicionado en esquina inferior izquierda',
          'Chat global agregado al componente lobby',
          'Corrección de errores de sintaxis HTML',
          'Mejoras visuales en componentes de chat'
        ]
      },
      {
        version: '1.1.0',
        date: '2024-09-16',
        title: 'Sistema de Chat Flotante',
        changes: [
          'Implementado chat flotante en tiempo real',
          'Conexión WebSocket para mensajes instantáneos',
          'Diseño moderno con animaciones suaves',
          'Totalmente responsive para dispositivos móviles'
        ]
      },
      {
        version: '1.0.0',
        date: '2024-09-16',
        title: 'Lanzamiento Inicial',
        changes: [
          'Juego de bingo multijugador completo',
          'Conexión en tiempo real con WebSockets',
          'Cartón de bingo oficial (3x9 con 5 números por fila)',
          'Sistema de salas multijugador',
          'Interfaz moderna y responsive'
        ]
      }
    ];
  }

  /**
   * Obtiene la versión formateada para mostrar
   * @returns string - Versión formateada
   */
  getFormattedVersion(): string {
    return `v${this.version}`;
  }

  /**
   * Muestra el modal con el changelog de la aplicación
   */
  showChangelogModal(): void {
    const changelog = this.getChangelog();
    
    let htmlContent = `
      <div class="changelog-container" style="text-align: left; max-height: 400px; overflow-y: auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin: 0;">🎮 ${this.appName}</h3>
          <p style="color: #64748b; margin: 5px 0;">Historial de Versiones</p>
        </div>
    `;

    changelog.forEach(release => {
      htmlContent += `
        <div style="margin-bottom: 25px; padding: 15px; background: linear-gradient(145deg, #f8fafc, #f1f5f9); border-radius: 12px; border-left: 4px solid #3b82f6;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="margin: 0; color: #1e293b; font-size: 1.1em;">v${release.version} - ${release.title}</h4>
            <span style="color: #64748b; font-size: 0.85em;">${release.date}</span>
          </div>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
      `;
      
      release.changes.forEach(change => {
        htmlContent += `<li style="margin-bottom: 5px; line-height: 1.4;">${change}</li>`;
      });
      
      htmlContent += `</ul></div>`;
    });

    htmlContent += '</div>';

    Swal.fire({
      title: `Novedades de ${this.appName}`,
      html: htmlContent,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3b82f6',
      width: '600px',
      customClass: {
        popup: 'changelog-popup',
        htmlContainer: 'changelog-html'
      },
      showClass: {
        popup: 'animate__animated animate__fadeInUp'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutDown'
      }
    });
  }
}

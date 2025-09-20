/**
 * COMPONENTE DE BIENVENIDA - Bingo Virtual
 *
 * Plataforma Educativa Interactiva
 *
 * @description
 * Este componente es la página principal de la aplicación y cumple múltiples funciones:
 *
 * 1. PRESENTACIÓN DEL PROYECTO:
 *    - Muestra información académica completa del Instituto Tecnológico Beltrán
 *    - Presenta el título y descripción del proyecto
 *    - Incluye datos de contacto y ubicación institucional
 *
 * 2. INFORMACIÓN TÉCNICA:
 *    - Describe las características técnicas implementadas
 *    - Explica los algoritmos y estructuras de datos utilizados
 *    - Detalla los patrones de diseño aplicados
 *
 * 3. NAVEGACIÓN:
 *    - Botones de acceso directo al juego
 *    - Enlace a documentación técnica detallada
 *    - Integración con sistema de rutas de Angular
 *
 * 4. DISEÑO VISUAL:
 *    - Layout responsive para todos los dispositivos
 *    - Gradientes y efectos visuales modernos
 *    - Animaciones y transiciones suaves
 *    - Glassmorphism y efectos de profundidad
 *
 * @technical_implementation
 * Tecnologías utilizadas:
 * - Angular 18 (Componentes standalone)
 * - TypeScript para type safety
 * - Tailwind CSS para estilos
 * - Material Design Icons
 * - Programación reactiva con RxJS
 *
 * @academic_context
 * Este componente forma parte del Trabajo Final de la materia
 * "Algoritmos y Estructuras de Datos III" del Instituto Tecnológico Beltrán.
 * Demuestra la aplicación práctica de conceptos avanzados de:
 * - Estructuras de datos (Arrays, Maps, Sets, Colas)
 * - Algoritmos de búsqueda y ordenamiento
 * - Patrones de diseño (Singleton, Observer, Factory, Strategy)
 * - Programación orientada a objetos
 * - Desarrollo full-stack con Angular y Node.js
 *
 * @authors
 * - Julián Manuel Cancelo <juliancancelo@gmail.com>
 * - Nicolás Otero <nicolasotero@gmail.com>
 *
 * @year 2025
 * @course Algoritmos y Estructuras de Datos III (ALED3)
 * @professor Sebastián Saldivar
 * @institution Instituto Tecnológico Beltrán
 * @location Av. Belgrano 1191, Avellaneda – Buenos Aires – Argentina
 */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10"></div>
      <div class="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl translate-x-48 translate-y-48"></div>

      <div class="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-16 animate-fadeIn">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6 transform hover:scale-105 transition-transform duration-300">
              <mat-icon class="text-white text-3xl">videogame_asset</mat-icon>
            </div>
            <h1 class="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span class="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 animate-gradient">
                Bingo Virtual
              </span>
              <span class="block text-3xl md:text-4xl font-medium text-gray-600">
                Plataforma Educativa Interactiva
              </span>
            </h1>
            <div class="max-w-3xl mx-auto px-4">
              <div class="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/30 transform hover:scale-105 transition-all duration-300">
                <p class="text-xl text-gray-700 mb-3 font-medium">
                  Proyecto Final 
                </p>
                <div class="text-blue-600 font-bold text-2xl mb-3">
                  Algoritmos y Estructuras de Datos III
                </div>
                <div class="text-gray-600 text-base italic">
                  Solución tecnológica para el aprendizaje interactivo
                </div>
              </div>
            </div>
          </div>

          <!-- Academic Info -->
          <div class="mt-12 bg-white/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/40 max-w-5xl mx-auto transform hover:shadow-3xl transition-all duration-300">
            <div class="text-center mb-10">
              <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">
                Proyecto Final ALED3
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                <div class="space-y-4">
                  <div class="group p-4 rounded-xl hover:bg-blue-50 transition-colors duration-200">
                    <p class="flex items-center mb-2">
                      <span class="w-28 font-semibold text-gray-700">Instituto:</span>
                      <span class="text-blue-600 font-medium">Instituto Tecnológico Beltrán (ITB)</span>
                    </p>
                  </div>
                  <div class="group p-4 rounded-xl hover:bg-blue-50 transition-colors duration-200">
                    <p class="flex items-start mb-2">
                      <span class="w-28 font-semibold text-gray-700">Ubicación:</span>
                      <span class="text-blue-600">Av. Belgrano 1191<br>Avellaneda – Buenos Aires – Argentina</span>
                    </p>
                  </div>
                  <div class="group p-4 rounded-xl hover:bg-blue-50 transition-colors duration-200">
                    <p class="flex items-start mb-2">
                      <span class="w-28 font-semibold text-gray-700">Contacto:</span>
                      <span class="text-blue-600 text-sm">
                        Teléfono: (+54.11) 4265.0247 / 4265.0342 / 4203.0134<br>
                        Email: informes&#64;ibeltran.com.ar
                      </span>
                    </p>
                  </div>
                  <div class="group p-4 rounded-xl hover:bg-blue-50 transition-colors duration-200">
                    <p class="flex items-center mb-2">
                      <span class="w-28 font-semibold text-gray-700">Materia:</span>
                      <span class="text-blue-600 font-medium">Algoritmos y Estructuras de Datos III (ALED3)</span>
                    </p>
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="group p-4 rounded-xl hover:bg-green-50 transition-colors duration-200">
                    <p class="flex items-center mb-2">
                      <span class="w-28 font-semibold text-gray-700">Profesor:</span>
                      <span class="text-green-600 font-medium">Sebastián Saldivar</span>
                    </p>
                  </div>
                  <div class="group p-4 rounded-xl hover:bg-green-50 transition-colors duration-200">
                    <p class="flex items-center mb-2">
                      <span class="w-28 font-semibold text-gray-700">Año:</span>
                      <span class="font-bold text-green-600 text-lg">2025</span>
                    </p>
                  </div>
                  <div class="group p-4 rounded-xl hover:bg-green-50 transition-colors duration-200">
                    <p class="flex items-center">
                      <span class="w-28 font-semibold text-gray-700">Autores:</span>
                      <span class="text-green-600 font-medium">Julián Manuel Cancelo & Nicolás Otero</span>
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-8">
                <div class="flex flex-wrap justify-center gap-4">
                  <div class="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-6 py-3 rounded-full font-medium border border-blue-300 hover:from-blue-200 hover:to-blue-300 transition-all duration-200 transform hover:scale-105 shadow-md">
                    Estructuras de Datos
                  </div>
                  <div class="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-6 py-3 rounded-full font-medium border border-green-300 hover:from-green-200 hover:to-green-300 transition-all duration-200 transform hover:scale-105 shadow-md">
                    Algoritmos Avanzados
                  </div>
                  <div class="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-6 py-3 rounded-full font-medium border border-purple-300 hover:from-purple-200 hover:to-purple-300 transition-all duration-200 transform hover:scale-105 shadow-md">
                    Patrones de Diseño
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Project Description -->
          <div class="mt-16 bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/30 max-w-5xl mx-auto transform hover:scale-105 transition-all duration-300">
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
                <mat-icon class="text-white text-2xl">info_outline</mat-icon>
              </div>
              <h3 class="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-6">
                Sobre el Proyecto
              </h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div class="text-gray-700 space-y-4">
                <p class="text-lg leading-relaxed">
                  Este proyecto implementa un <strong class="text-blue-600">sistema de bingo virtual multijugador</strong>
                  que demuestra la aplicación práctica de estructuras de datos avanzadas, algoritmos de búsqueda
                  y ordenamiento, y patrones de diseño fundamentales.
                </p>
                <p class="leading-relaxed">
                  Desarrollado con <strong class="text-blue-600">Angular 18</strong> y <strong class="text-blue-600">Node.js</strong>,
                  incluye comunicación en tiempo real mediante WebSockets, gestión eficiente de salas multijugador
                  y una interfaz responsive moderna.
                </p>
              </div>
              <div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">Características Destacadas</h4>
                <ul class="space-y-3 text-sm text-gray-700">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Comunicación en tiempo real
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Algoritmos optimizados O(1)
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Interfaz adaptable moderna
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Arquitectura escalable
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Access Buttons -->
          <div class="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center max-w-3xl mx-auto">
            <button
              (click)="navigateToGame()"
              class="group w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105">
              <div class="flex items-center justify-center space-x-3">
                <mat-icon class="text-2xl group-hover:animate-bounce">videogame_asset</mat-icon>
                <span>Acceder al Juego</span>
              </div>
            </button>

            <button
              (click)="navigateToConfiguration()"
              class="group w-full sm:w-auto px-10 py-4 border-2 border-purple-300 bg-white/80 backdrop-blur-sm text-purple-700 font-bold rounded-2xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
              <div class="flex items-center justify-center space-x-3">
                <mat-icon class="text-2xl group-hover:rotate-12 transition-transform">settings</mat-icon>
                <span>Configuración</span>
              </div>
            </button>
          </div>

          <!-- Technical Features Section -->
          <div class="mt-20">
            <div class="text-center mb-16">
              <h2 class="text-4xl font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Características Técnicas Implementadas
              </h2>
              <p class="text-gray-600 text-xl max-w-3xl mx-auto">
                Demostración práctica de conceptos avanzados de algoritmos y estructuras de datos
              </p>
            </div>

            <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4">
              <!-- Feature 1 -->
              <div class="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-8 border border-white/40 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-3 hover:scale-105">
                <div class="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <mat-icon class="text-3xl">data_object</mat-icon>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Estructuras de Datos</h3>
                <p class="text-gray-600 leading-relaxed">Arrays multidimensionales, Maps, Sets y colas para gestión eficiente del juego y estados del sistema.</p>
              </div>

              <!-- Feature 2 -->
              <div class="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-8 border border-white/40 hover:border-green-200 transition-all duration-300 transform hover:-translate-y-3 hover:scale-105">
                <div class="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <mat-icon class="text-3xl">psychology</mat-icon>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">Algoritmos Avanzados</h3>
                <p class="text-gray-600 leading-relaxed">Fisher-Yates para aleatorización, búsqueda con early termination y verificación de patrones ganadores.</p>
              </div>

              <!-- Feature 3 -->
              <div class="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-8 border border-white/40 hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-3 hover:scale-105">
                <div class="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <mat-icon class="text-3xl">architecture</mat-icon>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">Patrones de Diseño</h3>
                <p class="text-gray-600 leading-relaxed">Singleton, Observer, Factory y Strategy implementados en arquitectura real y escalable.</p>
              </div>

              <!-- Feature 4 -->
              <div class="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-8 border border-white/40 hover:border-red-200 transition-all duration-300 transform hover:-translate-y-3 hover:scale-105">
                <div class="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <mat-icon class="text-3xl">speed</mat-icon>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors">Análisis de Complejidad</h3>
                <p class="text-gray-600 leading-relaxed">Operaciones optimizadas O(1) con Maps y algoritmos de complejidad documentada y analizada.</p>
              </div>

              <!-- Feature 5 -->
              <div class="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-8 border border-white/40 hover:border-yellow-200 transition-all duration-300 transform hover:-translate-y-3 hover:scale-105">
                <div class="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <mat-icon class="text-3xl">hub</mat-icon>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-4 group-hover:text-yellow-600 transition-colors">Comunicación Real-time</h3>
                <p class="text-gray-600 leading-relaxed">WebSockets con Socket.IO para sincronización multijugador instantánea y fluida.</p>
              </div>

              <!-- Feature 6 -->
              <div class="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-8 border border-white/40 hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-3 hover:scale-105">
                <div class="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <mat-icon class="text-3xl">devices</mat-icon>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">Arquitectura Moderna</h3>
                <p class="text-gray-600 leading-relaxed">Angular 18 con componentes standalone y programación reactiva con RxJS observables.</p>
              </div>
            </div>
          </div>

          <!-- Academic Footer -->
          <div class="mt-20 text-center">
            <div class="bg-white/90 backdrop-blur-md rounded-3xl p-12 max-w-5xl mx-auto border border-white/40 shadow-2xl transform hover:shadow-3xl transition-all duration-300">
              <h3 class="text-3xl font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Trabajo Final - ALED3
              </h3>
              <p class="text-gray-600 mb-10 text-xl leading-relaxed">
                Este proyecto demuestra la implementación práctica de conceptos avanzados de
                algoritmos y estructuras de datos en un sistema real y funcional.
              </p>

              <div class="flex justify-center">
                <button
                  (click)="navigateToGame()"
                  class="px-12 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105">
                  <div class="flex items-center space-x-3">
                    <mat-icon class="text-2xl animate-pulse">videogame_asset</mat-icon>
                    <span>Probar el Sistema</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .animate-fadeIn {
      animation: fadeIn 0.6s ease-out;
    }

    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient 3s ease infinite;
    }

    .shadow-3xl {
      box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
    }
  `]
})
export class WelcomeComponent {
  /**
   * Constructor del componente - Implementa inyección de dependencias
   * @param router Servicio de navegación para redireccionar entre rutas
   *
   * @description
   * El constructor es el punto de entrada del componente donde se inyectan
   * las dependencias necesarias. Implementa el patrón de diseño de inversión
   * de control (IoC) característico de Angular.
   */
  constructor(private router: Router) {}

  /**
   * navigateToRegister - Redirecciona a la página de registro
   *
   * @description
   * Este método navega hacia la ruta de registro de usuarios.
   * Implementa el patrón Command para encapsular la lógica de navegación.
   *
   * @routing /auth/register - Ruta del módulo de autenticación
   */
  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * navigateToConfiguration - Redirecciona a la página de configuración
   *
   * @description
   * Navega hacia la página de configuración del sistema.
   * Implementa navegación programática con router.
   *
   * @routing /configuracion - Ruta del componente de configuración
   */
  navigateToConfiguration(): void {
    this.router.navigate(['/configuracion']);
  }

  /**
   * navigateToLogin - Redirecciona a la página de inicio de sesión
   *
   * @description
   * Navega hacia el formulario de login del sistema de autenticación.
   * Implementa navegación programática con parámetros de consulta.
   *
   * @routing /auth/login - Ruta del módulo de autenticación con modo login
   */
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * navigateToGame - Redirecciona al juego principal
   *
   * @description
   * Método principal de navegación que lleva al usuario al juego de bingo.
   * Este es el punto de entrada principal a la funcionalidad del juego multijugador.
   *
   * @routing /bingo - Ruta del componente principal del juego
   */
  navigateToGame(): void {
    this.router.navigate(['/bingo']);
  }
}

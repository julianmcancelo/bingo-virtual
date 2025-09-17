/**
 * COMPONENTE DE BIENVENIDA
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Componente de bienvenida que muestra los beneficios de registrarse
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
    <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span class="block">EduBingo Pro</span>
            <span class="block text-blue-600">Plataforma Educativa Interactiva</span>
          </h1>
          <div style="margin: 1.5rem auto 0; max-width: 48rem; padding: 0 1rem; text-align: center;">
            <div style="font-size: 1.125rem; line-height: 1.75rem; color: #4b5563; margin: 0;">
              <p style="margin: 0 0 0.5rem 0;">
                Proyecto Final - Cátedra de
              </p>
              <div style="color: #1e40af; font-weight: 500; margin: 0.5rem 0; font-size: 1.25rem; line-height: 1.5rem;">
                Algoritmos y Estructuras de Datos III
              </div>
              <div style="font-size: 0.9rem; color: #4b5563; margin-top: 0.5rem; font-style: italic;">
                Solución tecnológica para el aprendizaje interactivo
              </div>
            </div>
          </div>
          
          <!-- Academic Info -->
          <div style="margin-top: 2rem; background: rgba(255, 255, 255, 0.9); border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 2rem; max-width: 56rem; margin-left: auto; margin-right: auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e40af; margin-bottom: 1.5rem; letter-spacing: -0.025em;">Proyecto Final ALED3</h2>
              
              <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; color: #1e40af; margin-bottom: 1.5rem;">
                <div style="text-align: left;">
                  <p style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                    <span style="display: inline-block; width: 8rem; font-weight: 500; color: #1d4ed8;">Instituto:</span>
                    <span>Instituto Tecnológico Beltrán</span>
                  </p>
                  <p style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                    <span style="display: inline-block; width: 8rem; font-weight: 500; color: #1d4ed8;">Ubicación:</span>
                    <span>Avellaneda, Buenos Aires</span>
                  </p>
                  <p style="display: flex; align-items: center;">
                    <span style="display: inline-block; width: 8rem; font-weight: 500; color: #1d4ed8;">Materia:</span>
                    <span>Algoritmos y Estructuras de Datos III</span>
                  </p>
                </div>
                <div style="text-align: left;">
                  <p style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                    <span style="display: inline-block; width: 8rem; font-weight: 500; color: #1d4ed8;">Profesor:</span>
                    <span>Sebastián Saldivar</span>
                  </p>
                  <p style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                    <span style="display: inline-block; width: 8rem; font-weight: 500; color: #1d4ed8;">Autores:</span>
                    <span>Julián Manuel Cancelo & Nicolás Otero</span>
                  </p>
                  <p style="display: flex; align-items: center;">
                    <span style="display: inline-block; width: 8rem; font-weight: 500; color: #1d4ed8;">Año:</span>
                    <span style="font-weight: 600;">2025</span>
                  </p>
                </div>
              </div>

              <div style="padding-top: 1rem;">
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem;">
                  <div style="background: rgba(255, 255, 255, 0.95); color: #1e40af; padding: 0.625rem 1.25rem; border-radius: 9999px; font-weight: 500; border: 1px solid #bfdbfe; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: all 0.2s;">
                    Estructuras de Datos
                  </div>
                  <div style="background: rgba(255, 255, 255, 0.95); color: #1e40af; padding: 0.625rem 1.25rem; border-radius: 9999px; font-weight: 500; border: 1px solid #bfdbfe; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: all 0.2s;">
                    Algoritmos Avanzados
                  </div>
                  <div style="background: rgba(255, 255, 255, 0.95); color: #1e40af; padding: 0.625rem 1.25rem; border-radius: 9999px; font-weight: 500; border: 1px solid #bfdbfe; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: all 0.2s;">
                    Patrones de Diseño
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Project Description -->
        <div class="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-4xl mx-auto">
          <div class="text-center">
            <h3 class="text-lg font-medium text-gray-800 mb-4">
              Sobre el Proyecto
            </h3>
            <div class="text-sm text-gray-600 space-y-3">
              <p>
                Este proyecto implementa un sistema de bingo virtual multijugador que demuestra 
                la aplicación práctica de estructuras de datos avanzadas, algoritmos de búsqueda 
                y ordenamiento, y patrones de diseño fundamentales.
              </p>
              <p>
                Desarrollado con Angular 18 y Node.js, incluye comunicación en tiempo real 
                mediante WebSockets, gestión eficiente de salas multijugador y una interfaz 
                responsive moderna.
              </p>
            </div>
          </div>
        </div>

        <!-- Access Buttons -->
        <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
          <button 
            (click)="navigateToGame()" 
            class="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md">
            Acceder al Juego
          </button>
          
          <button 
            (click)="navigateToAbout()"
            class="w-full sm:w-auto px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200">
            Documentación Técnica
          </button>
        </div>

        <!-- Technical Features Section -->
        <div class="mt-16">
          <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">
            Características Técnicas Implementadas
          </h2>
          
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <!-- Feature 1 -->
            <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                <mat-icon>data_object</mat-icon>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Estructuras de Datos</h3>
              <p class="text-gray-600">Arrays multidimensionales, Maps, Sets y colas para gestión eficiente del juego.</p>
            </div>

            <!-- Feature 2 -->
            <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mb-4">
                <mat-icon>psychology</mat-icon>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Algoritmos Avanzados</h3>
              <p class="text-gray-600">Fisher-Yates para aleatorización, búsqueda con early termination y verificación de patrones.</p>
            </div>

            <!-- Feature 3 -->
            <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mb-4">
                <mat-icon>architecture</mat-icon>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Patrones de Diseño</h3>
              <p class="text-gray-600">Singleton, Observer, Factory y Strategy implementados en arquitectura real.</p>
            </div>

            <!-- Feature 4 -->
            <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white mb-4">
                <mat-icon>speed</mat-icon>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Análisis de Complejidad</h3>
              <p class="text-gray-600">Operaciones optimizadas O(1) con Maps y algoritmos de complejidad documentada.</p>
            </div>

            <!-- Feature 5 -->
            <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white mb-4">
                <mat-icon>hub</mat-icon>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Comunicación Real-time</h3>
              <p class="text-gray-600">WebSockets con Socket.IO para sincronización multijugador instantánea.</p>
            </div>

            <!-- Feature 6 -->
            <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                <mat-icon>devices</mat-icon>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Arquitectura Moderna</h3>
              <p class="text-gray-600">Angular 18 con componentes standalone y programación reactiva con RxJS.</p>
            </div>
          </div>
        </div>

        <!-- Academic Footer -->
        <div class="mt-16 text-center">
          <div class="bg-gray-50 rounded-2xl p-8 max-w-3xl mx-auto border border-gray-200">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Trabajo Final - ALED3</h3>
            <p class="text-gray-600 mb-6">
              Este proyecto demuestra la implementación práctica de conceptos avanzados de 
              algoritmos y estructuras de datos en un sistema real y funcional.
            </p>
            
            <div class="space-y-4">
              <div class="flex justify-center">
                <button 
                  (click)="navigateToGame()" 
                  class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md">
                  Probar el Sistema
                </button>
              </div>
              
              <div class="bg-gray-100 rounded-lg p-6 mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-3">Proyecto Final ALED3</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p><strong>Instituto:</strong> Instituto Tecnológico Beltrán</p>
                    <p><strong>Ubicación:</strong> Avellaneda, Buenos Aires</p>
                    <p><strong>Materia:</strong> Algoritmos y Estructuras de Datos III</p>
                  </div>
                  <div>
                    <p><strong>Profesor:</strong> Sebastián Saldivar</p>
                    <p><strong>Autores:</strong> Julián Manuel Cancelo & Nicolás Otero</p>
                    <p><strong>Año:</strong> 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-gradient-to-b {
      background: linear-gradient(to bottom, var(--tw-gradient-stops));
    }
  `]
})
export class WelcomeComponent {
  constructor(private router: Router) {}

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToGame(): void {
    this.router.navigate(['/bingo']);
  }
}

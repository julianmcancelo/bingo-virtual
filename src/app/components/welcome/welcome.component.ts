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
        <div class="text-center mb-12">
          <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span class="block">¡Bienvenido a</span>
            <span class="block text-blue-600">Bingo Virtual</span>
          </h1>
          <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            La mejor experiencia de bingo en línea con premios increíbles y diversión asegurada
          </p>
          
          <!-- Urgent Call to Action -->
          <div class="mt-8 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-lg p-6 max-w-4xl mx-auto shadow-xl">
            <div class="text-white text-center">
              <h2 class="text-2xl font-bold mb-2">🎉 ¡REGÍSTRATE Y DESBLOQUEA TODOS LOS BENEFICIOS! 🎉</h2>
              <p class="text-lg mb-4">
                <strong>Los invitados pueden jugar, pero los miembros obtienen mucho más:</strong><br>
                Premios exclusivos, estadísticas, torneos y la experiencia completa del bingo.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div class="bg-white text-gray-800 px-4 py-2 rounded-full font-semibold">
                  ✨ Registro 100% GRATIS
                </div>
                <div class="bg-white text-gray-800 px-4 py-2 rounded-full font-semibold">
                  🏆 Premios Exclusivos
                </div>
                <div class="bg-white text-gray-800 px-4 py-2 rounded-full font-semibold">
                  📊 Estadísticas Completas
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Access Section -->
        <div class="mt-10 bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg max-w-4xl mx-auto">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <mat-icon class="text-blue-400">info</mat-icon>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-blue-800">
                🎮 ¡Todos pueden jugar! Pero los miembros obtienen mucho más
              </h3>
              <div class="mt-2 text-sm text-blue-700">
                <p>
                  <strong>🎯 Invitados:</strong> Pueden jugar partidas básicas de bingo.
                  <br>
                  <strong>👑 Miembros registrados:</strong> Acceso completo a premios, estadísticas, torneos, salas privadas y bonos especiales.
                  <br>
                  <strong>🎁 Oferta limitada:</strong> Los primeros 100 usuarios que se registren hoy recibirán bonos especiales de bienvenida.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Access Buttons -->
        <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button (click)="navigateToGame()" class="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200">
            🎮 Jugar como Invitado
          </button>
          <span class="text-gray-400 font-medium">o</span>
          <button 
            mat-raised-button 
            color="accent" 
            class="w-full mb-4 py-3 text-lg font-semibold"
            (click)="navigateToRegister()">
            👑 Registrarse para Beneficios Completos
          </button>
          
          <button 
            mat-stroked-button 
            color="primary" 
            class="w-full mb-4 py-3 text-lg font-semibold"
            (click)="navigateToAbout()">
            ℹ️ Información del Proyecto
          </button>
        </div>

        <!-- Benefits Section -->
        <div class="mt-10">
          <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">
            ¡Regístrate ahora y disfruta de estos beneficios exclusivos!
          </h2>
          
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <!-- Benefit 1 -->
            <div class="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                <mat-icon>sports_esports</mat-icon>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Juega Partidas Ilimitadas</h3>
              <p class="text-gray-600">Accede a salas exclusivas y juega tantas partidas como quieras sin restricciones.</p>
            </div>

            <!-- Benefit 2 -->
            <div class="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mb-4">
                <mat-icon>emoji_events</mat-icon>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Participa en Torneos</h3>
              <p class="text-gray-600">Compite contra otros jugadores y gana premios increíbles en nuestros torneos especiales.</p>
            </div>

            <!-- Benefit 3 -->
            <div class="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mb-4">
                <mat-icon>leaderboard</mat-icon>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Sigue tu Progreso</h3>
              <p class="text-gray-600">Revisa tus estadísticas, logros y posición en el ranking de jugadores.</p>
            </div>

            <!-- Benefit 4 -->
            <div class="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white mb-4">
                <mat-icon>card_giftcard</mat-icon>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Bonos de Bienvenida</h3>
              <p class="text-gray-600">Recibe bonos especiales solo por registrarte y completar tu perfil.</p>
            </div>

            <!-- Benefit 5 -->
            <div class="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white mb-4">
                <mat-icon>groups</mat-icon>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Comunidad Activa</h3>
              <p class="text-gray-600">Únete a nuestra comunidad, haz amigos y comparte la emoción del bingo.</p>
            </div>

            <!-- Benefit 6 -->
            <div class="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                <mat-icon>security</mat-icon>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Seguridad Garantizada</h3>
              <p class="text-gray-600">Tus datos están protegidos con los más altos estándares de seguridad.</p>
            </div>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="mt-16 text-center">
          <div class="bg-gray-50 rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">🚀 ¡Empieza a Jugar en 30 Segundos!</h3>
            <p class="text-gray-600 mb-6">Únete a miles de jugadores que ya están ganando premios increíbles</p>
            
            <div class="space-y-4">
              <div class="inline-flex rounded-md shadow-lg">
                <button (click)="navigateToRegister()" class="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-lg text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-xl">
                  🎯 CREAR CUENTA GRATIS - ¡JUGAR AHORA!
                </button>
              </div>
              
              <div class="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span>✅ Sin tarjeta de crédito</span>
                <span>•</span>
                <span>✅ Registro instantáneo</span>
                <span>•</span>
                <span>✅ Bonos de bienvenida</span>
              </div>
              
              <div class="mt-6 pt-4 border-t border-gray-200">
                <button (click)="navigateToLogin()" class="inline-flex items-center font-semibold text-blue-600 hover:text-blue-700 text-lg">
                  <span class="mr-2">👋</span>
                  ¿Ya tienes cuenta? Inicia sesión y continúa ganando
                  <span class="ml-2">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Testimonials -->
        <div class="mt-20">
          <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">
            Lo que dicen nuestros jugadores
          </h2>
          <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="flex items-center mb-4">
                <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">M</div>
                <div class="ml-4">
                  <h4 class="font-medium text-gray-900">María G.</h4>
                  <div class="flex text-yellow-400">
                    ★★★★★
                  </div>
                </div>
              </div>
              <p class="text-gray-600 italic">"El mejor bingo en línea que he probado. ¡Las recompensas son increíbles y la comunidad es muy amigable!"</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="flex items-center mb-4">
                <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">C</div>
                <div class="ml-4">
                  <h4 class="font-medium text-gray-900">Carlos M.</h4>
                  <div class="flex text-yellow-400">
                    ★★★★★
                  </div>
                </div>
              </div>
              <p class="text-gray-600 italic">"Me encanta participar en los torneos. ¡Ya gané mi primer premio la semana pasada!"</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="flex items-center mb-4">
                <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">L</div>
                <div class="ml-4">
                  <h4 class="font-medium text-gray-900">Laura V.</h4>
                  <div class="flex text-yellow-400">
                    ★★★★★
                  </div>
                </div>
              </div>
              <p class="text-gray-600 italic">"La interfaz es muy intuitiva y las partidas son muy divertidas. ¡Totalmente recomendado!"</p>
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

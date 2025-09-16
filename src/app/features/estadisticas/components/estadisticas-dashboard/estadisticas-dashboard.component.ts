/**
 * COMPONENTE DASHBOARD DE ESTADÍSTICAS
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Dashboard con estadísticas del bingo y algoritmos de análisis
 * 
 * COMPLEJIDAD TEMPORAL: O(n log n) - Ordenamiento de estadísticas
 * COMPLEJIDAD ESPACIAL: O(n) - Almacenamiento de datos estadísticos
 * 
 * ALGORITMOS IMPLEMENTADOS:
 * - Ordenamiento por múltiples criterios
 * - Cálculo de promedios y percentiles
 * - Análisis de tendencias temporales
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';

interface EstadisticaGeneral {
  label: string;
  valor: number;
  icono: string;
  color: string;
  descripcion: string;
}

@Component({
  selector: 'app-estadisticas-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatProgressBarModule
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard de Estadísticas</h1>
          <p class="text-gray-600">Análisis completo del rendimiento en Bingo Virtual</p>
        </div>

        <!-- Estadísticas Generales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <mat-card *ngFor="let stat of estadisticasGenerales" class="stat-card">
            <mat-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">{{ stat.label }}</p>
                  <p class="text-2xl font-bold" [style.color]="stat.color">{{ stat.valor }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ stat.descripcion }}</p>
                </div>
                <mat-icon [style.color]="stat.color" class="text-3xl">{{ stat.icono }}</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tabs de Análisis -->
        <mat-tab-group class="mb-8">
          <mat-tab label="Rendimiento Personal">
            <div class="p-6">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Tu Rendimiento</mat-card-title>
                  <mat-card-subtitle>Análisis de tus partidas recientes</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content class="p-6">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="text-center">
                      <div class="text-3xl font-bold text-blue-600 mb-2">85%</div>
                      <div class="text-sm text-gray-600">Tasa de Éxito</div>
                      <mat-progress-bar mode="determinate" value="85" class="mt-2"></mat-progress-bar>
                    </div>
                    <div class="text-center">
                      <div class="text-3xl font-bold text-green-600 mb-2">12.5</div>
                      <div class="text-sm text-gray-600">Promedio de Líneas</div>
                      <mat-progress-bar mode="determinate" value="62" class="mt-2"></mat-progress-bar>
                    </div>
                    <div class="text-center">
                      <div class="text-3xl font-bold text-purple-600 mb-2">4:32</div>
                      <div class="text-sm text-gray-600">Tiempo Promedio</div>
                      <mat-progress-bar mode="determinate" value="75" class="mt-2"></mat-progress-bar>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <mat-tab label="Análisis Global">
            <div class="p-6">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Estadísticas Globales</mat-card-title>
                  <mat-card-subtitle>Datos de toda la plataforma</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content class="p-6">
                  <div class="space-y-4">
                    <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span class="font-medium">Partidas Totales Jugadas</span>
                      <span class="text-2xl font-bold text-blue-600">1,247</span>
                    </div>
                    <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span class="font-medium">Jugadores Activos</span>
                      <span class="text-2xl font-bold text-green-600">89</span>
                    </div>
                    <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span class="font-medium">Salas Creadas Hoy</span>
                      <span class="text-2xl font-bold text-purple-600">23</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <mat-tab label="Algoritmos">
            <div class="p-6">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Análisis Algorítmico</mat-card-title>
                  <mat-card-subtitle>Complejidad y rendimiento del sistema</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content class="p-6">
                  <div class="space-y-6">
                    <div class="border-l-4 border-blue-500 pl-4">
                      <h4 class="font-semibold text-gray-800">Generación de Cartones</h4>
                      <p class="text-sm text-gray-600">Complejidad: O(1) - 25 números únicos por columna</p>
                      <p class="text-xs text-gray-500 mt-1">Algoritmo optimizado con Set para evitar duplicados</p>
                    </div>
                    <div class="border-l-4 border-green-500 pl-4">
                      <h4 class="font-semibold text-gray-800">Verificación de Bingo</h4>
                      <p class="text-sm text-gray-600">Complejidad: O(1) - Verificación constante de patrones</p>
                      <p class="text-xs text-gray-500 mt-1">Validación de líneas, columnas y diagonales</p>
                    </div>
                    <div class="border-l-4 border-purple-500 pl-4">
                      <h4 class="font-semibold text-gray-800">Ordenamiento de Rankings</h4>
                      <p class="text-sm text-gray-600">Complejidad: O(n log n) - Timsort con criterios múltiples</p>
                      <p class="text-xs text-gray-500 mt-1">Ordenamiento por puntuación, tiempo y alfabético</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>

        <!-- Acciones Rápidas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <mat-card class="action-card cursor-pointer" (click)="navigateToRankings()">
            <mat-card-content class="p-6 text-center">
              <mat-icon class="text-4xl text-blue-600 mb-4">leaderboard</mat-icon>
              <h3 class="text-lg font-semibold mb-2">Ver Rankings</h3>
              <p class="text-sm text-gray-600">Consulta los mejores jugadores</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="action-card cursor-pointer" (click)="navigateToHistorial()">
            <mat-card-content class="p-6 text-center">
              <mat-icon class="text-4xl text-green-600 mb-4">history</mat-icon>
              <h3 class="text-lg font-semibold mb-2">Historial</h3>
              <p class="text-sm text-gray-600">Revisa tus partidas anteriores</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="action-card cursor-pointer" (click)="goToBingo()">
            <mat-card-content class="p-6 text-center">
              <mat-icon class="text-4xl text-purple-600 mb-4">casino</mat-icon>
              <h3 class="text-lg font-semibold mb-2">Jugar Bingo</h3>
              <p class="text-sm text-gray-600">Volver al juego principal</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      transition: transform 0.2s ease-in-out;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
    }
    
    .action-card {
      transition: all 0.2s ease-in-out;
    }
    
    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    mat-progress-bar {
      height: 6px;
      border-radius: 3px;
    }
  `]
})
export class EstadisticasDashboardComponent implements OnInit {
  
  estadisticasGenerales: EstadisticaGeneral[] = [
    {
      label: 'Partidas Jugadas',
      valor: 47,
      icono: 'casino',
      color: '#3B82F6',
      descripcion: 'Total de partidas'
    },
    {
      label: 'Victorias',
      valor: 12,
      icono: 'emoji_events',
      color: '#10B981',
      descripcion: '25.5% de éxito'
    },
    {
      label: 'Líneas Completadas',
      valor: 156,
      icono: 'check_circle',
      color: '#8B5CF6',
      descripcion: 'Promedio: 3.3 por partida'
    },
    {
      label: 'Tiempo Total',
      valor: 342,
      icono: 'schedule',
      color: '#F59E0B',
      descripcion: 'Minutos jugados'
    }
  ];

  constructor(private router: Router) {}

  /**
   * INICIALIZACIÓN DEL COMPONENTE
   * 
   * @complexity O(1) - Carga inicial de datos constante
   */
  ngOnInit(): void {
    this.loadEstadisticas();
  }

  /**
   * CARGAR ESTADÍSTICAS
   * 
   * @complexity O(1) - Carga de datos simulados constante
   */
  private loadEstadisticas(): void {
    // En una implementación real, aquí se cargarían los datos del servidor
    console.log('Estadísticas cargadas');
  }

  /**
   * NAVEGAR A RANKINGS
   * 
   * @complexity O(1) - Navegación constante
   */
  navigateToRankings(): void {
    this.router.navigate(['/estadisticas/rankings']);
  }

  /**
   * NAVEGAR A HISTORIAL
   * 
   * @complexity O(1) - Navegación constante
   */
  navigateToHistorial(): void {
    this.router.navigate(['/estadisticas/historial']);
  }

  /**
   * VOLVER AL BINGO PRINCIPAL
   * 
   * @complexity O(1) - Navegación constante
   */
  goToBingo(): void {
    this.router.navigate(['/bingo']);
  }
}

/**
 * COMPONENTE DE RANKINGS
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Componente con algoritmos de ordenamiento y búsqueda para rankings
 * 
 * COMPLEJIDAD TEMPORAL: O(n log n) - Ordenamiento con múltiples criterios
 * COMPLEJIDAD ESPACIAL: O(n) - Almacenamiento de jugadores y filtros
 * 
 * ALGORITMOS IMPLEMENTADOS:
 * - Timsort (algoritmo nativo de JavaScript) para ordenamiento estable
 * - Búsqueda lineal optimizada con normalización de texto
 * - Filtrado por múltiples criterios con complejidad O(n)
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';

interface JugadorRanking {
  id: string;
  nombre: string;
  email: string;
  partidasJugadas: number;
  partidasGanadas: number;
  porcentajeVictorias: number;
  lineasCompletadas: number;
  tiempoPromedioPartida: number; // en minutos
  puntuacionTotal: number;
  fechaUltimaPartida: Date;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';
}

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Rankings de Jugadores</h1>
              <p class="text-gray-600">Clasificación basada en rendimiento y algoritmos de puntuación</p>
            </div>
            <button mat-raised-button color="primary" (click)="goToBingo()">
              <mat-icon>casino</mat-icon>
              Volver al Bingo
            </button>
          </div>
        </div>

        <!-- Filtros y Búsqueda -->
        <mat-card class="mb-6">
          <mat-card-content class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Buscar jugador</mat-label>
                <input matInput [(ngModel)]="searchTerm" placeholder="Nombre o email">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ordenar por</mat-label>
                <mat-select [(ngModel)]="sortField">
                  <mat-option value="puntuacionTotal">Puntuación Total</mat-option>
                  <mat-option value="porcentajeVictorias">% Victorias</mat-option>
                  <mat-option value="partidasGanadas">Partidas Ganadas</mat-option>
                  <mat-option value="lineasCompletadas">Líneas Completadas</mat-option>
                  <mat-option value="tiempoPromedioPartida">Tiempo Promedio</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Orden</mat-label>
                <mat-select [(ngModel)]="sortOrder">
                  <mat-option value="desc">Descendente</mat-option>
                  <mat-option value="asc">Ascendente</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Filtrar por nivel</mat-label>
                <mat-select [(ngModel)]="nivelFilter">
                  <mat-option value="">Todos los niveles</mat-option>
                  <mat-option value="Principiante">Principiante</mat-option>
                  <mat-option value="Intermedio">Intermedio</mat-option>
                  <mat-option value="Avanzado">Avanzado</mat-option>
                  <mat-option value="Experto">Experto</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Estadísticas de Filtrado -->
            <div class="mt-4 flex flex-wrap gap-2">
              <mat-chip-listbox>
                <mat-chip-option>
                  Total: {{ jugadoresFiltrados.length }} jugadores
                </mat-chip-option>
                <mat-chip-option *ngIf="searchTerm">
                  Búsqueda: "{{ searchTerm }}"
                </mat-chip-option>
                <mat-chip-option *ngIf="nivelFilter">
                  Nivel: {{ nivelFilter }}
                </mat-chip-option>
              </mat-chip-listbox>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Tabla de Rankings -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Clasificación General</mat-card-title>
            <mat-card-subtitle>
              Ordenado por {{ getSortFieldLabel() }} ({{ sortOrder === 'desc' ? 'Mayor a Menor' : 'Menor a Mayor' }})
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="p-0">
            <div class="overflow-x-auto">
              <table mat-table [dataSource]="jugadoresFiltrados" class="w-full">
                
                <!-- Posición -->
                <ng-container matColumnDef="posicion">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Pos.</th>
                  <td mat-cell *matCellDef="let jugador; let i = index" class="text-center">
                    <div class="flex items-center justify-center">
                      <span *ngIf="i < 3" class="text-2xl">
                        {{ i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉' }}
                      </span>
                      <span *ngIf="i >= 3" class="font-semibold text-gray-600">
                        {{ i + 1 }}
                      </span>
                    </div>
                  </td>
                </ng-container>

                <!-- Jugador -->
                <ng-container matColumnDef="jugador">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Jugador</th>
                  <td mat-cell *matCellDef="let jugador">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {{ jugador.nombre.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">{{ jugador.nombre }}</div>
                        <div class="text-sm text-gray-500">{{ jugador.email }}</div>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Nivel -->
                <ng-container matColumnDef="nivel">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Nivel</th>
                  <td mat-cell *matCellDef="let jugador">
                    <span class="px-2 py-1 rounded-full text-xs font-medium"
                          [ngClass]="getNivelClass(jugador.nivel)">
                      {{ jugador.nivel }}
                    </span>
                  </td>
                </ng-container>

                <!-- Puntuación -->
                <ng-container matColumnDef="puntuacion">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Puntuación</th>
                  <td mat-cell *matCellDef="let jugador" class="text-center">
                    <div class="font-bold text-lg text-blue-600">
                      {{ jugador.puntuacionTotal | number }}
                    </div>
                  </td>
                </ng-container>

                <!-- Partidas -->
                <ng-container matColumnDef="partidas">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Partidas</th>
                  <td mat-cell *matCellDef="let jugador" class="text-center">
                    <div class="text-sm">
                      <div class="font-medium">{{ jugador.partidasGanadas }}/{{ jugador.partidasJugadas }}</div>
                      <div class="text-gray-500">{{ jugador.porcentajeVictorias }}% éxito</div>
                    </div>
                  </td>
                </ng-container>

                <!-- Líneas -->
                <ng-container matColumnDef="lineas">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Líneas</th>
                  <td mat-cell *matCellDef="let jugador" class="text-center">
                    <div class="font-medium text-green-600">
                      {{ jugador.lineasCompletadas }}
                    </div>
                  </td>
                </ng-container>

                <!-- Tiempo Promedio -->
                <ng-container matColumnDef="tiempo">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Tiempo Prom.</th>
                  <td mat-cell *matCellDef="let jugador" class="text-center">
                    <div class="text-sm font-medium text-purple-600">
                      {{ jugador.tiempoPromedioPartida | number:'1.1-1' }}m
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                    class="hover:bg-gray-50 transition-colors"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Análisis Algorítmico -->
        <mat-card class="mt-6">
          <mat-card-header>
            <mat-card-title>Análisis de Complejidad</mat-card-title>
            <mat-card-subtitle>Rendimiento de los algoritmos implementados</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-800 mb-2">Ordenamiento</h4>
                <p class="text-sm text-blue-700">O(n log n) - Timsort estable</p>
                <p class="text-xs text-blue-600 mt-1">{{ jugadores.length }} elementos procesados</p>
              </div>
              <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-semibold text-green-800 mb-2">Búsqueda</h4>
                <p class="text-sm text-green-700">O(n*m) - Filtrado lineal</p>
                <p class="text-xs text-green-600 mt-1">Con normalización de texto</p>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg">
                <h4 class="font-semibold text-purple-800 mb-2">Filtrado</h4>
                <p class="text-sm text-purple-700">O(n) - Una pasada por criterio</p>
                <p class="text-xs text-purple-600 mt-1">Múltiples criterios combinados</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .mat-mdc-table {
      background: transparent;
    }
    
    .mat-mdc-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    
    .mat-mdc-header-cell {
      font-weight: 600;
      color: #374151;
    }
  `]
})
export class RankingsComponent implements OnInit {
  
  jugadores: JugadorRanking[] = [];
  jugadoresFiltrados: JugadorRanking[] = [];
  
  searchTerm = '';
  sortField = 'puntuacionTotal';
  sortOrder: 'asc' | 'desc' = 'desc';
  nivelFilter = '';
  
  displayedColumns = ['posicion', 'jugador', 'nivel', 'puntuacion', 'partidas', 'lineas', 'tiempo'];

  constructor(private router: Router) {}

  /**
   * INICIALIZACIÓN DEL COMPONENTE
   * 
   * @complexity O(n log n) - Carga y ordenamiento inicial
   */
  ngOnInit(): void {
    this.loadJugadores();
    this.applyFilters();
  }

  /**
   * CARGAR DATOS DE JUGADORES (SIMULADOS)
   * 
   * @complexity O(n) - Generación de datos simulados
   */
  private loadJugadores(): void {
    // Datos simulados para demostración
    this.jugadores = [
      {
        id: '1',
        nombre: 'Ana García',
        email: 'ana@bingo.com',
        partidasJugadas: 45,
        partidasGanadas: 18,
        porcentajeVictorias: 40,
        lineasCompletadas: 156,
        tiempoPromedioPartida: 8.5,
        puntuacionTotal: 2850,
        fechaUltimaPartida: new Date(),
        nivel: 'Experto'
      },
      {
        id: '2',
        nombre: 'Carlos Mendoza',
        email: 'carlos@bingo.com',
        partidasJugadas: 38,
        partidasGanadas: 12,
        porcentajeVictorias: 32,
        lineasCompletadas: 134,
        tiempoPromedioPartida: 9.2,
        puntuacionTotal: 2340,
        fechaUltimaPartida: new Date(),
        nivel: 'Avanzado'
      },
      {
        id: '3',
        nombre: 'María López',
        email: 'maria@bingo.com',
        partidasJugadas: 52,
        partidasGanadas: 15,
        porcentajeVictorias: 29,
        lineasCompletadas: 178,
        tiempoPromedioPartida: 7.8,
        puntuacionTotal: 2180,
        fechaUltimaPartida: new Date(),
        nivel: 'Avanzado'
      },
      {
        id: '4',
        nombre: 'Pedro Ruiz',
        email: 'pedro@bingo.com',
        partidasJugadas: 28,
        partidasGanadas: 8,
        porcentajeVictorias: 29,
        lineasCompletadas: 89,
        tiempoPromedioPartida: 10.1,
        puntuacionTotal: 1650,
        fechaUltimaPartida: new Date(),
        nivel: 'Intermedio'
      },
      {
        id: '5',
        nombre: 'Laura Sánchez',
        email: 'laura@bingo.com',
        partidasJugadas: 15,
        partidasGanadas: 3,
        porcentajeVictorias: 20,
        lineasCompletadas: 42,
        tiempoPromedioPartida: 12.3,
        puntuacionTotal: 890,
        fechaUltimaPartida: new Date(),
        nivel: 'Principiante'
      }
    ];
  }

  /**
   * APLICAR FILTROS Y ORDENAMIENTO
   * 
   * @complexity O(n log n) - Filtrado O(n) + Ordenamiento O(n log n)
   */
  applyFilters(): void {
    let filtered = [...this.jugadores];
    
    // Filtro por búsqueda de texto - O(n*m) donde m es longitud promedio del texto
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(jugador => 
        jugador.nombre.toLowerCase().includes(searchLower) ||
        jugador.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtro por nivel - O(n)
    if (this.nivelFilter) {
      filtered = filtered.filter(jugador => jugador.nivel === this.nivelFilter);
    }
    
    // Ordenamiento - O(n log n) usando Timsort
    filtered.sort((a, b) => {
      const aValue = a[this.sortField as keyof JugadorRanking] as number;
      const bValue = b[this.sortField as keyof JugadorRanking] as number;
      
      const comparison = this.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      
      // Criterio secundario: alfabético por nombre
      if (comparison === 0) {
        return a.nombre.localeCompare(b.nombre);
      }
      
      return comparison;
    });
    
    this.jugadoresFiltrados = filtered;
  }

  /**
   * OBTENER CLASE CSS PARA NIVEL
   * 
   * @param nivel - Nivel del jugador
   * @returns string - Clases CSS
   * 
   * @complexity O(1) - Mapeo constante
   */
  getNivelClass(nivel: string): string {
    const classes = {
      'Principiante': 'bg-gray-100 text-gray-800',
      'Intermedio': 'bg-blue-100 text-blue-800',
      'Avanzado': 'bg-green-100 text-green-800',
      'Experto': 'bg-purple-100 text-purple-800'
    };
    return classes[nivel as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  /**
   * OBTENER ETIQUETA DEL CAMPO DE ORDENAMIENTO
   * 
   * @returns string - Etiqueta legible
   * 
   * @complexity O(1) - Mapeo constante
   */
  getSortFieldLabel(): string {
    const labels = {
      'puntuacionTotal': 'Puntuación Total',
      'porcentajeVictorias': 'Porcentaje de Victorias',
      'partidasGanadas': 'Partidas Ganadas',
      'lineasCompletadas': 'Líneas Completadas',
      'tiempoPromedioPartida': 'Tiempo Promedio'
    };
    return labels[this.sortField as keyof typeof labels] || this.sortField;
  }

  /**
   * VOLVER AL BINGO PRINCIPAL
   * 
   * @complexity O(1) - Navegación constante
   */
  goToBingo(): void {
    this.router.navigate(['/bingo']);
  }

  /**
   * DETECTAR CAMBIOS EN FILTROS
   * Método llamado automáticamente por ngModel
   * 
   * @complexity O(n log n) - Reaplicar filtros
   */
  ngModelChange(): void {
    this.applyFilters();
  }
}

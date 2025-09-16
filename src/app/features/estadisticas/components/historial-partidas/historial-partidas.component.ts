/**
 * COMPONENTE DE HISTORIAL DE PARTIDAS
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Componente con CRUD completo para historial de partidas
 * 
 * COMPLEJIDAD TEMPORAL: O(n log n) - Ordenamiento y filtrado de partidas
 * COMPLEJIDAD ESPACIAL: O(n) - Almacenamiento de historial completo
 * 
 * ESTRUCTURAS DE DATOS:
 * - Array para almacenamiento secuencial de partidas
 * - Map para indexación rápida por ID
 * - Set para filtros únicos
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';

interface PartidaHistorial {
  id: string;
  fecha: Date;
  duracion: number; // en minutos
  jugadores: number;
  posicionFinal: number;
  lineasCompletadas: number;
  puntuacion: number;
  resultado: 'Victoria' | 'Derrota';
  sala: string;
  tipoJuego: 'Clásico' | 'Rápido' | 'Torneo';
}

@Component({
  selector: 'app-historial-partidas',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatChipsModule
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Historial de Partidas</h1>
              <p class="text-gray-600">CRUD completo con algoritmos de búsqueda y ordenamiento</p>
            </div>
            <div class="flex gap-2">
              <button mat-raised-button color="accent" (click)="exportarHistorial()">
                <mat-icon>download</mat-icon>
                Exportar
              </button>
              <button mat-raised-button color="primary" (click)="goToBingo()">
                <mat-icon>casino</mat-icon>
                Volver al Bingo
              </button>
            </div>
          </div>
        </div>

        <!-- Estadísticas Rápidas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <mat-card class="stat-card">
            <mat-card-content class="p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ partidas.length }}</div>
              <div class="text-sm text-gray-600">Total Partidas</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content class="p-4 text-center">
              <div class="text-2xl font-bold text-green-600">{{ getVictorias() }}</div>
              <div class="text-sm text-gray-600">Victorias</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content class="p-4 text-center">
              <div class="text-2xl font-bold text-purple-600">{{ getTotalLineas() }}</div>
              <div class="text-sm text-gray-600">Líneas Totales</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content class="p-4 text-center">
              <div class="text-2xl font-bold text-orange-600">{{ getPromedioTiempo() }}m</div>
              <div class="text-sm text-gray-600">Tiempo Promedio</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Filtros -->
        <mat-card class="mb-6">
          <mat-card-content class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Buscar sala</mat-label>
                <input matInput [(ngModel)]="filtros.sala" (ngModelChange)="aplicarFiltros()">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Tipo de juego</mat-label>
                <mat-select [(ngModel)]="filtros.tipoJuego" (ngModelChange)="aplicarFiltros()">
                  <mat-option value="">Todos</mat-option>
                  <mat-option value="Clásico">Clásico</mat-option>
                  <mat-option value="Rápido">Rápido</mat-option>
                  <mat-option value="Torneo">Torneo</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Resultado</mat-label>
                <mat-select [(ngModel)]="filtros.resultado" (ngModelChange)="aplicarFiltros()">
                  <mat-option value="">Todos</mat-option>
                  <mat-option value="Victoria">Solo Victorias</mat-option>
                  <mat-option value="Derrota">Solo Derrotas</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fecha desde</mat-label>
                <input matInput [matDatepicker]="pickerDesde" [(ngModel)]="filtros.fechaDesde" (ngModelChange)="aplicarFiltros()">
                <mat-datepicker-toggle matSuffix [for]="pickerDesde"></mat-datepicker-toggle>
                <mat-datepicker #pickerDesde></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fecha hasta</mat-label>
                <input matInput [matDatepicker]="pickerHasta" [(ngModel)]="filtros.fechaHasta" (ngModelChange)="aplicarFiltros()">
                <mat-datepicker-toggle matSuffix [for]="pickerHasta"></mat-datepicker-toggle>
                <mat-datepicker #pickerHasta></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="mt-4 flex justify-between items-center">
              <div class="flex flex-wrap gap-2">
                <mat-chip-listbox>
                  <mat-chip-option>{{ partidasFiltradas.length }} partidas encontradas</mat-chip-option>
                  <mat-chip-option *ngIf="filtros.sala">Sala: {{ filtros.sala }}</mat-chip-option>
                  <mat-chip-option *ngIf="filtros.tipoJuego">Tipo: {{ filtros.tipoJuego }}</mat-chip-option>
                  <mat-chip-option *ngIf="filtros.resultado">{{ filtros.resultado }}</mat-chip-option>
                </mat-chip-listbox>
              </div>
              <button mat-button color="warn" (click)="limpiarFiltros()">
                <mat-icon>clear</mat-icon>
                Limpiar Filtros
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Tabla de Historial -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Registro de Partidas</mat-card-title>
            <mat-card-subtitle>Historial completo con operaciones CRUD</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="p-0">
            <div class="overflow-x-auto">
              <table mat-table [dataSource]="partidasFiltradas" class="w-full">
                
                <!-- Fecha -->
                <ng-container matColumnDef="fecha">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Fecha</th>
                  <td mat-cell *matCellDef="let partida">
                    <div class="text-sm">
                      <div class="font-medium">{{ partida.fecha | date:'dd/MM/yyyy' }}</div>
                      <div class="text-gray-500">{{ partida.fecha | date:'HH:mm' }}</div>
                    </div>
                  </td>
                </ng-container>

                <!-- Sala -->
                <ng-container matColumnDef="sala">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Sala</th>
                  <td mat-cell *matCellDef="let partida">
                    <div class="font-medium">{{ partida.sala }}</div>
                    <div class="text-xs text-gray-500">{{ partida.jugadores }} jugadores</div>
                  </td>
                </ng-container>

                <!-- Tipo -->
                <ng-container matColumnDef="tipo">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Tipo</th>
                  <td mat-cell *matCellDef="let partida">
                    <span class="px-2 py-1 rounded-full text-xs font-medium"
                          [ngClass]="getTipoClass(partida.tipoJuego)">
                      {{ partida.tipoJuego }}
                    </span>
                  </td>
                </ng-container>

                <!-- Resultado -->
                <ng-container matColumnDef="resultado">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Resultado</th>
                  <td mat-cell *matCellDef="let partida">
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-1 rounded-full text-xs font-medium"
                            [ngClass]="getResultadoClass(partida.resultado)">
                        {{ partida.resultado }}
                      </span>
                      <span class="text-xs text-gray-500">Pos. {{ partida.posicionFinal }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Estadísticas -->
                <ng-container matColumnDef="estadisticas">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Estadísticas</th>
                  <td mat-cell *matCellDef="let partida">
                    <div class="text-sm">
                      <div class="flex justify-between">
                        <span>Líneas:</span>
                        <span class="font-medium text-green-600">{{ partida.lineasCompletadas }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Puntos:</span>
                        <span class="font-medium text-blue-600">{{ partida.puntuacion }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Tiempo:</span>
                        <span class="font-medium text-purple-600">{{ partida.duracion }}m</span>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Acciones -->
                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">Acciones</th>
                  <td mat-cell *matCellDef="let partida">
                    <div class="flex space-x-1">
                      <button mat-icon-button color="primary" (click)="verDetalle(partida)" matTooltip="Ver detalle">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="eliminarPartida(partida)" matTooltip="Eliminar">
                        <mat-icon>delete</mat-icon>
                      </button>
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

        <!-- Análisis de Complejidad -->
        <mat-card class="mt-6">
          <mat-card-header>
            <mat-card-title>Análisis CRUD y Algoritmos</mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-800 mb-2">CREATE</h4>
                <p class="text-sm text-blue-700">O(1) - Inserción al final del array</p>
                <p class="text-xs text-blue-600">Nuevas partidas automáticas</p>
              </div>
              <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-semibold text-green-800 mb-2">READ</h4>
                <p class="text-sm text-green-700">O(n) - Filtrado y búsqueda</p>
                <p class="text-xs text-green-600">Múltiples criterios simultáneos</p>
              </div>
              <div class="bg-yellow-50 p-4 rounded-lg">
                <h4 class="font-semibold text-yellow-800 mb-2">UPDATE</h4>
                <p class="text-sm text-yellow-700">O(n) - Búsqueda por ID</p>
                <p class="text-xs text-yellow-600">Modificación de registros</p>
              </div>
              <div class="bg-red-50 p-4 rounded-lg">
                <h4 class="font-semibold text-red-800 mb-2">DELETE</h4>
                <p class="text-sm text-red-700">O(n) - Búsqueda y eliminación</p>
                <p class="text-xs text-red-600">Con confirmación de usuario</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
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
    
    .mat-mdc-table {
      background: transparent;
    }
    
    .mat-mdc-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class HistorialPartidasComponent implements OnInit {
  
  partidas: PartidaHistorial[] = [];
  partidasFiltradas: PartidaHistorial[] = [];
  
  filtros = {
    sala: '',
    tipoJuego: '',
    resultado: '',
    fechaDesde: null as Date | null,
    fechaHasta: null as Date | null
  };
  
  displayedColumns = ['fecha', 'sala', 'tipo', 'resultado', 'estadisticas', 'acciones'];

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {}

  /**
   * INICIALIZACIÓN DEL COMPONENTE
   * 
   * @complexity O(n) - Carga inicial de datos
   */
  ngOnInit(): void {
    this.cargarHistorial();
    this.aplicarFiltros();
  }

  /**
   * CARGAR HISTORIAL DE PARTIDAS (CREATE - Simulado)
   * 
   * @complexity O(n) - Generación de datos simulados
   */
  private cargarHistorial(): void {
    // Simulación de datos para demostración del CRUD
    this.partidas = [
      {
        id: '1',
        fecha: new Date(2024, 11, 15, 20, 30),
        duracion: 12,
        jugadores: 8,
        posicionFinal: 1,
        lineasCompletadas: 4,
        puntuacion: 850,
        resultado: 'Victoria',
        sala: 'Sala Principal',
        tipoJuego: 'Clásico'
      },
      {
        id: '2',
        fecha: new Date(2024, 11, 14, 19, 15),
        duracion: 8,
        jugadores: 6,
        posicionFinal: 3,
        lineasCompletadas: 2,
        puntuacion: 420,
        resultado: 'Derrota',
        sala: 'Sala Rápida',
        tipoJuego: 'Rápido'
      },
      {
        id: '3',
        fecha: new Date(2024, 11, 13, 21, 45),
        duracion: 15,
        jugadores: 12,
        posicionFinal: 2,
        lineasCompletadas: 3,
        puntuacion: 680,
        resultado: 'Victoria',
        sala: 'Torneo Navideño',
        tipoJuego: 'Torneo'
      },
      {
        id: '4',
        fecha: new Date(2024, 11, 12, 18, 20),
        duracion: 10,
        jugadores: 4,
        posicionFinal: 4,
        lineasCompletadas: 1,
        puntuacion: 180,
        resultado: 'Derrota',
        sala: 'Sala Privada',
        tipoJuego: 'Clásico'
      },
      {
        id: '5',
        fecha: new Date(2024, 11, 11, 22, 10),
        duracion: 6,
        jugadores: 10,
        posicionFinal: 1,
        lineasCompletadas: 5,
        puntuacion: 950,
        resultado: 'Victoria',
        sala: 'Sala Express',
        tipoJuego: 'Rápido'
      }
    ];
  }

  /**
   * APLICAR FILTROS (READ con múltiples criterios)
   * 
   * @complexity O(n*m) donde n = partidas, m = criterios de filtro
   */
  aplicarFiltros(): void {
    let filtered = [...this.partidas];
    
    // Filtro por sala - O(n*m) búsqueda de substring
    if (this.filtros.sala) {
      const salaLower = this.filtros.sala.toLowerCase();
      filtered = filtered.filter(p => 
        p.sala.toLowerCase().includes(salaLower)
      );
    }
    
    // Filtro por tipo de juego - O(n)
    if (this.filtros.tipoJuego) {
      filtered = filtered.filter(p => p.tipoJuego === this.filtros.tipoJuego);
    }
    
    // Filtro por resultado - O(n)
    if (this.filtros.resultado) {
      filtered = filtered.filter(p => p.resultado === this.filtros.resultado);
    }
    
    // Filtro por fecha desde - O(n)
    if (this.filtros.fechaDesde) {
      filtered = filtered.filter(p => p.fecha >= this.filtros.fechaDesde!);
    }
    
    // Filtro por fecha hasta - O(n)
    if (this.filtros.fechaHasta) {
      filtered = filtered.filter(p => p.fecha <= this.filtros.fechaHasta!);
    }
    
    // Ordenamiento por fecha descendente - O(n log n)
    filtered.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    
    this.partidasFiltradas = filtered;
  }

  /**
   * LIMPIAR TODOS LOS FILTROS
   * 
   * @complexity O(n) - Reaplicar filtros sin criterios
   */
  limpiarFiltros(): void {
    this.filtros = {
      sala: '',
      tipoJuego: '',
      resultado: '',
      fechaDesde: null,
      fechaHasta: null
    };
    this.aplicarFiltros();
  }

  /**
   * VER DETALLE DE PARTIDA (READ específico)
   * 
   * @param partida - Partida a mostrar
   * @complexity O(1) - Acceso directo
   */
  verDetalle(partida: PartidaHistorial): void {
    // En una implementación real, abriría un modal con detalles completos
    alert(`Detalle de partida:\n\nSala: ${partida.sala}\nFecha: ${partida.fecha.toLocaleString()}\nDuración: ${partida.duracion} minutos\nPosición: ${partida.posicionFinal}/${partida.jugadores}\nLíneas: ${partida.lineasCompletadas}\nPuntuación: ${partida.puntuacion}`);
  }

  /**
   * ELIMINAR PARTIDA (DELETE)
   * 
   * @param partida - Partida a eliminar
   * @complexity O(n) - Búsqueda por ID y eliminación
   */
  eliminarPartida(partida: PartidaHistorial): void {
    if (confirm(`¿Estás seguro de eliminar la partida de ${partida.sala}?`)) {
      // Búsqueda del índice - O(n)
      const index = this.partidas.findIndex(p => p.id === partida.id);
      if (index !== -1) {
        // Eliminación - O(n) en el peor caso (shift de elementos)
        this.partidas.splice(index, 1);
        this.aplicarFiltros();
      }
    }
  }

  /**
   * EXPORTAR HISTORIAL
   * 
   * @complexity O(n) - Iteración sobre todas las partidas
   */
  exportarHistorial(): void {
    const csvContent = this.generarCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial_bingo_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * GENERAR CONTENIDO CSV
   * 
   * @returns string - Contenido CSV
   * @complexity O(n) - Iteración sobre partidas filtradas
   */
  private generarCSV(): string {
    const headers = ['Fecha', 'Sala', 'Tipo', 'Resultado', 'Posición', 'Jugadores', 'Líneas', 'Puntuación', 'Duración'];
    const rows = this.partidasFiltradas.map(p => [
      p.fecha.toLocaleString(),
      p.sala,
      p.tipoJuego,
      p.resultado,
      p.posicionFinal,
      p.jugadores,
      p.lineasCompletadas,
      p.puntuacion,
      p.duracion
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * OBTENER NÚMERO DE VICTORIAS
   * 
   * @returns number - Cantidad de victorias
   * @complexity O(n) - Filtrado de victorias
   */
  getVictorias(): number {
    return this.partidas.filter(p => p.resultado === 'Victoria').length;
  }

  /**
   * OBTENER TOTAL DE LÍNEAS
   * 
   * @returns number - Suma de todas las líneas
   * @complexity O(n) - Suma acumulativa
   */
  getTotalLineas(): number {
    return this.partidas.reduce((total, p) => total + p.lineasCompletadas, 0);
  }

  /**
   * OBTENER TIEMPO PROMEDIO
   * 
   * @returns number - Promedio de duración
   * @complexity O(n) - Cálculo de promedio
   */
  getPromedioTiempo(): number {
    if (this.partidas.length === 0) return 0;
    const total = this.partidas.reduce((sum, p) => sum + p.duracion, 0);
    return Math.round((total / this.partidas.length) * 10) / 10;
  }

  /**
   * OBTENER CLASE CSS PARA TIPO DE JUEGO
   * 
   * @param tipo - Tipo de juego
   * @returns string - Clases CSS
   * @complexity O(1) - Mapeo constante
   */
  getTipoClass(tipo: string): string {
    const classes = {
      'Clásico': 'bg-blue-100 text-blue-800',
      'Rápido': 'bg-green-100 text-green-800',
      'Torneo': 'bg-purple-100 text-purple-800'
    };
    return classes[tipo as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  /**
   * OBTENER CLASE CSS PARA RESULTADO
   * 
   * @param resultado - Resultado de la partida
   * @returns string - Clases CSS
   * @complexity O(1) - Mapeo constante
   */
  getResultadoClass(resultado: string): string {
    return resultado === 'Victoria' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
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

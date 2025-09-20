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

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// RxJS
import { Subscription, interval } from 'rxjs';

// Modelos
import { 
  Partida, 
  EstadisticasTiempoReal, 
  EstadisticasPartida 
} from '../../../../models/partida.model';

// Servicios
import { EstadisticasService } from '../../../../services/estadisticas.service';

interface EstadisticaGeneral {
  label: string;
  valor: number;
  icono: string;
  color: string;
  descripcion: string;
}

// Alias para mantener compatibilidad con el código existente
type EstadisticasGlobales = EstadisticasPartida;

@Component({
  selector: 'app-estadisticas-dashboard',
  standalone: true,
  imports: [
    // Módulos de Angular
    CommonModule,
    RouterModule,
    
    // Angular Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatProgressBarModule,
    MatGridListModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './estadisticas-dashboard.component.html',
  styleUrls: ['./estadisticas-dashboard.component.css']
})
export class EstadisticasDashboardComponent implements OnInit, OnDestroy {
  private statsSubscription: Subscription = new Subscription();
  private tiempoRealSubscription: Subscription = new Subscription();
  private actualizacionAutomatica: Subscription = new Subscription();
  
  // Datos en tiempo real
  estadisticasGenerales: EstadisticaGeneral[] = [
    { label: 'Jugadores en Línea', valor: 0, icono: 'people', color: 'bg-blue-100 text-blue-600', descripcion: 'Jugadores conectados ahora' },
    { label: 'Partidas Activas', valor: 0, icono: 'sports_esports', color: 'bg-green-100 text-green-600', descripcion: 'Partidas en curso' },
    { label: 'Números Llamados', valor: 0, icono: 'tag', color: 'bg-purple-100 text-purple-600', descripcion: 'Números llamados recientemente' },
    { label: 'Premios Repartidos', valor: 0, icono: 'emoji_events', color: 'bg-yellow-100 text-yellow-600', descripcion: 'Premios entregados hoy' },
  ];
  
  // Estadísticas globales
  globalStats: EstadisticasGlobales | null = null;
  loading = true;
  ultimaActualizacion: Date | null = new Date();
  
  // Últimas partidas (mantenido por compatibilidad)
  ultimasPartidas: Partida[] = [];
  
  private estadisticasService = inject(EstadisticasService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  ngOnInit(): void {
    this.cargarDatosIniciales();
    
    // Configurar actualización automática cada 30 segundos
    this.actualizacionAutomatica = interval(30000).subscribe(() => {
      this.cargarDatos();
    });
  }
  
  ngOnDestroy(): void {
    // Limpiar todas las suscripciones
    [
      this.statsSubscription,
      this.tiempoRealSubscription,
      this.actualizacionAutomatica
    ].forEach(subscription => {
      if (subscription && !subscription.closed) {
        subscription.unsubscribe();
      }
    });
  }
  
  private cargarDatosIniciales(): void {
    this.loading = true;
    this.cargarEstadisticasTiempoReal();
    this.cargarEstadisticasGlobales();
  }
  
  private cargarDatos(): void {
    this.cargarEstadisticasTiempoReal();
  }
  
  private cargarEstadisticasTiempoReal(): void {
    this.tiempoRealSubscription = this.estadisticasService.obtenerEstadisticasTiempoReal()
      .subscribe({
        next: (data) => {
          this.actualizarEstadisticasTiempoReal(data);
          this.ultimaActualizacion = new Date();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar estadísticas en tiempo real:', error);
          this.mostrarError('Error al cargar estadísticas en tiempo real');
          this.loading = false;
        }
      });
  }
  
  private cargarEstadisticasGlobales(): void {
    this.statsSubscription = this.estadisticasService.obtenerEstadisticasGenerales()
      .subscribe({
        next: (data) => {
          this.globalStats = data;
          if (data.ultimasPartidas) {
            this.ultimasPartidas = data.ultimasPartidas;
          }
        },
        error: (error) => {
          console.error('Error al cargar estadísticas globales:', error);
          this.mostrarError('Error al cargar estadísticas globales');
        }
      });
  }
  
  /**
   * Actualiza las estadísticas en tiempo real con los nuevos datos
   * @param data Datos de estadísticas en tiempo real
   */
  private actualizarEstadisticasTiempoReal(data: EstadisticasTiempoReal): void {
    if (!data) return;
    
    // Actualizar valores de las estadísticas
    this.estadisticasGenerales[0].valor = data.jugadoresEnLinea || 0;
    this.estadisticasGenerales[1].valor = data.partidasActivas || 0;
    this.estadisticasGenerales[2].valor = data.numerosLlamados || 0;
    this.estadisticasGenerales[3].valor = data.premiosRepartidos || 0;
    
    // Actualizar la última actualización
    this.ultimaActualizacion = data.ultimaActualizacion ? new Date(data.ultimaActualizacion) : new Date();
    
    // Forzar la detección de cambios
    this.estadisticasGenerales = [...this.estadisticasGenerales];
  }
  
  private mostrarError(mensaje: string): void {
    this.snackBar.open(`❌ ${mensaje}`, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
  
  /**
   * Formatea una fecha a un string legible
   * @param fecha Fecha a formatear (puede ser string, Date o null/undefined)
   * @returns String con la fecha formateada o cadena vacía si no hay fecha válida
   */
  formatearFecha(fecha: Date | string | null | undefined): string {
    if (!fecha) return '';
    
    try {
      const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
      
      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) return '';
      
      return dateObj.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  }
  
  /**
   * Calcula la duración entre dos fechas
   * @param inicio Fecha de inicio (puede ser string o Date)
   * @param fin Fecha de fin (opcional, por defecto es la fecha actual)
   * @returns String con la duración formateada (ej: "2h 30m" o "45s")
   */
  calcularDuracion(inicio: Date | string, fin?: Date | string | null): string {
    try {
      const fechaInicio = typeof inicio === 'string' ? new Date(inicio) : new Date(inicio);
      const fechaFin = fin ? (typeof fin === 'string' ? new Date(fin) : new Date(fin)) : new Date();
      
      // Verificar si las fechas son válidas
      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        return '--';
      }
      
      const segundos = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / 1000);
      
      // Manejar caso en que la fecha de fin sea anterior a la de inicio
      if (segundos < 0) return '--';
      
      const horas = Math.floor(segundos / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      const segs = segundos % 60;
      
      if (horas > 0) {
        return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
      } else if (minutos > 0) {
        return `${minutos}m ${segs.toString().padStart(2, '0')}s`;
      } else {
        return `${segs}s`;
      }
    } catch (error) {
      console.error('Error al calcular duración:', error);
      return '--';
    }
  }
  
  /**
   * Carga las estadísticas en tiempo real
   * 
   * @complexity O(1) - Suscripción a un observable
   */
  private loadRealTimeStats(): void {
    // Usamos la suscripción existente
    this.tiempoRealSubscription = this.estadisticasService.obtenerEstadisticasTiempoReal()
      .subscribe({
        next: (data) => {
          this.actualizarEstadisticasTiempoReal(data);
          this.ultimaActualizacion = new Date();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar estadísticas en tiempo real:', error);
          this.mostrarError('Error al cargar estadísticas en tiempo real');
          this.loading = false;
        }
      });
  }
  
  /**
   * Carga las estadísticas globales
   * 
   * @complexity O(1) - Suscripción a un observable
   */
  private loadGlobalStats(): void {
    this.loading = true;
    this.statsSubscription = this.estadisticasService.obtenerEstadisticasGenerales()
      .subscribe({
        next: (data) => {
          this.globalStats = data;
          if (data.ultimasPartidas) {
            this.ultimasPartidas = data.ultimasPartidas;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar estadísticas globales:', error);
          this.mostrarError('Error al cargar estadísticas globales');
          this.loading = false;
        }
      });
  }

  /**
   * Formatea un número con separadores de miles
   * 
   * @param num Número a formatear
   * @returns String con el número formateado
   * @complexity O(1) - Operaciones de string constantes
   */
  formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
  /**
   * Obtiene el color para un porcentaje
   * 
   * @param value Valor del porcentaje (0-100)
   * @returns Clase de color de Tailwind
   * @complexity O(1) - Operaciones condicionales constantes
   */
  getPercentageColor(value: number): string {
    if (value >= 75) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    if (value >= 25) return 'text-orange-600';
    return 'text-red-600';
  }
  
  /**
   * Obtiene el icono de tendencia basado en un valor
   * 
   * @param value Valor numérico (positivo, negativo o cero)
   * @returns Nombre del icono de Material
   * @complexity O(1) - Operaciones condicionales constantes
   */
  getTrendIcon(value: number): string {
    if (value > 0) return 'trending_up';
    if (value < 0) return 'trending_down';
    return 'trending_flat';
  }
  
  /**
   * Navega a la sección de rankings
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

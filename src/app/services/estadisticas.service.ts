/**
 * SERVICIO DE ESTADÍSTICAS
 * 
 * @description Maneja el registro y consulta de estadísticas del juego
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 */

/**
 * MODELO DE PARTIDA
 * 
 * @description Define la estructura de una partida de bingo
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 */

export * from '../models/partida.model';

import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { Partida, EstadisticasPartida, EstadisticasTiempoReal } from '../models/partida.model';
import { HttpClient } from '@angular/common/http';
// Configuración del entorno
let apiUrl = 'http://localhost:3000/api';

// Verificar si estamos en producción
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  apiUrl = 'https://bingo-virtual.onrender.com/api';
}
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService implements OnDestroy {
  private baseUrl = `${apiUrl}/estadisticas`;
  private estadisticasSubject = new BehaviorSubject<EstadisticasPartida | null>(null);
  private tiempoRealSubject = new BehaviorSubject<EstadisticasTiempoReal>({
    jugadoresEnLinea: 0,
    partidasActivas: 0,
    numerosLlamados: 0,
    premiosRepartidos: 0,
    ultimaActualizacion: new Date()
  });
  
  private updateSubscription: Subscription | undefined;

  constructor(private http: HttpClient) {
    // Actualizar estadísticas en tiempo real cada 30 segundos
    this.updateSubscription = interval(30000).subscribe(() => {
      this.actualizarEstadisticasTiempoReal();
    });
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  // Obtener estadísticas generales
  obtenerEstadisticasGenerales(): Observable<EstadisticasPartida> {
    return this.http.get<EstadisticasPartida>(`${this.baseUrl}/generales`).pipe(
      map(estadisticas => {
        // Procesar fechas de string a objetos Date
        if (estadisticas.ultimasPartidas) {
          estadisticas.ultimasPartidas = estadisticas.ultimasPartidas.map(partida => ({
            ...partida,
            fechaInicio: new Date(partida.fechaInicio),
            fechaFin: partida.fechaFin ? new Date(partida.fechaFin) : undefined
          }));
        }
        this.estadisticasSubject.next(estadisticas);
        return estadisticas;
      })
    );
  }

  // Obtener estadísticas en tiempo real
  obtenerEstadisticasTiempoReal(): Observable<EstadisticasTiempoReal> {
    return this.tiempoRealSubject.asObservable();
  }

  // Actualizar estadísticas en tiempo real
  actualizarEstadisticasTiempoReal(): void {
    this.http.get<EstadisticasTiempoReal>(`${this.baseUrl}/tiempo-real`).subscribe({
      next: (data) => {
        this.tiempoRealSubject.next({
          ...data,
          ultimaActualizacion: new Date()
        });
      },
      error: (error) => {
        console.error('Error al actualizar estadísticas en tiempo real:', error);
      }
    });
  }

  // Registrar una nueva partida
  registrarPartida(partida: Omit<Partida, 'id' | 'fechaInicio' | 'estado'>): Observable<Partida> {
    return this.http.post<Partida>(`${this.baseUrl}/partidas`, {
      ...partida,
      fechaInicio: new Date().toISOString(),
      estado: 'EN_CURSO'
    });
  }

  // Actualizar una partida existente
  actualizarPartida(id: string, cambios: Partial<Partida>): Observable<Partida> {
    return this.http.put<Partida>(`${this.baseUrl}/partidas/${id}`, cambios);
  }

  // Obtener estadísticas de un jugador específico
  obtenerEstadisticasJugador(jugadorId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/jugadores/${jugadorId}`);
  }

  // Obtener el historial de partidas con filtros opcionales
  obtenerHistorial(filtros: {
    modoJuego?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    jugadorId?: string;
    limit?: number;
  } = {}): Observable<Partida[]> {
    const params: any = {};
    
    if (filtros.modoJuego) params.modoJuego = filtros.modoJuego;
    if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio.toISOString();
    if (filtros.fechaFin) params.fechaFin = filtros.fechaFin.toISOString();
    if (filtros.jugadorId) params.jugadorId = filtros.jugadorId;
    if (filtros.limit) params.limit = filtros.limit.toString();

    return this.http.get<Partida[]>(`${this.baseUrl}/partidas`, { params }).pipe(
      map(partidas => partidas.map(partida => ({
        ...partida,
        fechaInicio: new Date(partida.fechaInicio),
        fechaFin: partida.fechaFin ? new Date(partida.fechaFin) : undefined
      })))
    );
  }
}

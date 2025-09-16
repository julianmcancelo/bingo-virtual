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
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketService, MensajeChat } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  
  // BehaviorSubject para mantener el estado de los mensajes
  private mensajesSubject = new BehaviorSubject<MensajeChat[]>([]);
  public mensajes$ = this.mensajesSubject.asObservable();
  
  // Estado del chat (abierto/cerrado)
  private chatAbiertoSubject = new BehaviorSubject<boolean>(false);
  public chatAbierto$ = this.chatAbiertoSubject.asObservable();
  
  // Contador de mensajes no leídos
  private mensajesNoLeidosSubject = new BehaviorSubject<number>(0);
  public mensajesNoLeidos$ = this.mensajesNoLeidosSubject.asObservable();

  constructor(private socketService: SocketService) {
    this.inicializarEventosSocket();
  }

  /**
   * Inicializa los eventos de socket para el chat
   */
  private inicializarEventosSocket(): void {
    // Escuchar mensajes entrantes
    this.socketService.mensajeRecibido$.subscribe((mensaje: MensajeChat) => {
      console.log('ChatService: Mensaje recibido del socket:', mensaje);
      this.agregarMensaje(mensaje);
      
      // Incrementar contador si el chat está cerrado
      if (!this.chatAbiertoSubject.value) {
        this.incrementarMensajesNoLeidos();
      }
    });

    // Limpiar mensajes cuando se cambia de sala
    this.socketService.salaActualizada$.subscribe(() => {
      console.log('ChatService: Sala actualizada, limpiando mensajes');
      this.limpiarMensajes();
    });
  }

  /**
   * Envía un mensaje al chat
   * @param salaId - ID de la sala
   * @param jugadorId - ID del jugador
   * @param mensaje - Contenido del mensaje
   */
  enviarMensaje(salaId: string, jugadorNombre: string, mensaje: string): void {
    if (mensaje.trim()) {
      console.log('ChatService: Enviando mensaje:', { salaId, jugadorNombre, mensaje });
      this.socketService.enviarMensaje(salaId, jugadorNombre, mensaje.trim());
    }
  }

  /**
   * Agrega un mensaje al chat
   * @param mensaje - Mensaje a agregar
   */
  private agregarMensaje(mensaje: MensajeChat): void {
    const mensajesActuales = this.mensajesSubject.value;
    const nuevosMensajes = [...mensajesActuales, mensaje];
    this.mensajesSubject.next(nuevosMensajes);
  }

  /**
   * Obtiene todos los mensajes del chat
   * @returns Observable con la lista de mensajes
   */
  getMensajes(): Observable<MensajeChat[]> {
    return this.mensajes$;
  }

  /**
   * Abre el chat y resetea el contador de no leídos
   */
  abrirChat(): void {
    this.chatAbiertoSubject.next(true);
    this.resetearMensajesNoLeidos();
  }

  /**
   * Cierra el chat
   */
  cerrarChat(): void {
    this.chatAbiertoSubject.next(false);
  }

  /**
   * Alterna el estado del chat
   */
  toggleChat(): void {
    const estadoActual = this.chatAbiertoSubject.value;
    if (estadoActual) {
      this.cerrarChat();
    } else {
      this.abrirChat();
    }
  }

  /**
   * Verifica si el chat está abierto
   * @returns Observable con el estado del chat
   */
  isChatAbierto(): Observable<boolean> {
    return this.chatAbierto$;
  }

  /**
   * Obtiene el número de mensajes no leídos
   * @returns Observable con el contador de mensajes no leídos
   */
  getMensajesNoLeidos(): Observable<number> {
    return this.mensajesNoLeidos$;
  }

  /**
   * Incrementa el contador de mensajes no leídos
   */
  private incrementarMensajesNoLeidos(): void {
    const actual = this.mensajesNoLeidosSubject.value;
    this.mensajesNoLeidosSubject.next(actual + 1);
  }

  /**
   * Resetea el contador de mensajes no leídos
   */
  private resetearMensajesNoLeidos(): void {
    this.mensajesNoLeidosSubject.next(0);
  }

  /**
   * Limpia todos los mensajes del chat
   */
  private limpiarMensajes(): void {
    this.mensajesSubject.next([]);
    this.resetearMensajesNoLeidos();
  }

  /**
   * Formatea la hora de un mensaje
   * @param timestamp - Timestamp del mensaje
   * @returns Hora formateada
   */
  formatearHora(timestamp: Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * Verifica si un mensaje es del jugador actual
   * @param mensaje - Mensaje a verificar
   * @param nombreJugadorActual - Nombre del jugador actual
   * @returns true si el mensaje es del jugador actual
   */
  esMensajePropio(mensaje: MensajeChat, nombreJugadorActual: string): boolean {
    return mensaje.jugador === nombreJugadorActual;
  }
}

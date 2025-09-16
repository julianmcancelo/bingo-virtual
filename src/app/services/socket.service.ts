/**
 * SERVICIO SOCKET.IO PARA BINGO MULTIJUGADOR
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Servicio Angular que maneja la comunicación WebSocket con el servidor
 * 
 * PATRONES DE DISEÑO IMPLEMENTADOS:
 * - Singleton: Una sola instancia del servicio en toda la aplicación
 * - Observer: Uso de RxJS Observables para eventos en tiempo real
 * - Facade: Interfaz simplificada para operaciones Socket.IO complejas
 */

import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, Subject } from 'rxjs';

/**
 * INTERFACES PARA TIPADO FUERTE
 * 
 * @description Definimos interfaces para mantener consistencia de datos
 */
export interface Jugador {
  id: string;
  nombre: string;
  socketId?: string;
  carton?: CeldaBingo[][];
  puntuacion: number;
  lineasCompletadas: number;
  tiempoConexion?: Date;
}

export interface CeldaBingo {
  numero: number;
  marcada: boolean;
  esLibre?: boolean;
}

export interface Sala {
  id: string;
  nombre: string;
  jugadores: Jugador[];
  juegoIniciado: boolean;
  numerosSorteados?: number[];
  numeroActual?: number;
  createdAt?: Date;
}

export interface MensajeChat {
  id: string;
  jugador: string;
  mensaje: string;
  timestamp: Date;
}

export interface EventoBingo {
  jugador: string;
  tipo: 'fila' | 'columna' | 'diagonal';
  linea: number | string;
  esGanador: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  
  /**
   * PROPIEDADES DEL SERVICIO
   * 
   * @description Manejo de estado y conexión Socket.IO
   */
  public socket!: Socket;
  private readonly SERVER_URL = environment.serverUrl;
  
  // BehaviorSubjects para estado reactivo
  private conectadoSubject = new BehaviorSubject<boolean>(false);
  private socketIdSubject = new BehaviorSubject<string | null>(null);
  private salaActualSubject = new BehaviorSubject<Sala | null>(null);
  private jugadorActualSubject = new BehaviorSubject<Jugador | null>(null);
  private jugadoresSubject = new BehaviorSubject<Jugador[]>([]);
  private mensajesChatSubject = new BehaviorSubject<MensajeChat[]>([]);
  
  // Subjects para eventos específicos
  private numeroSorteadoSubject = new Subject<{numero: number, numerosSorteados: number[], totalSorteados: number}>();
  private bingoSubject = new Subject<EventoBingo>();
  private errorSubject = new Subject<{mensaje: string}>();
  private juegoIniciadoSubject = new Subject<{mensaje: string, jugadores: number}>();

  /**
   * OBSERVABLES PÚBLICOS
   * 
   * @description Expone streams de datos para componentes
   */
  public conectado$ = this.conectadoSubject;
  public socketId$ = this.socketIdSubject;
  public salaActual$ = this.salaActualSubject.asObservable();
  public jugadorActual$ = this.jugadorActualSubject.asObservable();
  public jugadores$ = this.jugadoresSubject.asObservable();
  public mensajesChat$ = this.mensajesChatSubject.asObservable();
  public numeroSorteado$ = this.numeroSorteadoSubject.asObservable();
  public bingo$ = this.bingoSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public juegoIniciado$ = this.juegoIniciadoSubject.asObservable();

  constructor() {
    // La conexión se iniciará manualmente
  }

  /**
   * INICIALIZACIÓN DE SOCKET.IO
   * 
   * @description Establece conexión y configura listeners de eventos
   * @complexity O(1) para inicialización, O(n) para eventos con múltiples jugadores
   */
  /**
   * CONECTAR AL SERVIDOR
   *
   * @description Inicia la conexión con el servidor Socket.IO y configura los listeners
   */
  public connect(): void {
    if (this.socket?.connected) {
      console.log('[SOCKET] Ya conectado.');
      this.conectadoSubject.next(true);
      return;
    }
    console.log('[SOCKET] Intentando conectar a', this.SERVER_URL);
    this.socket = io(this.SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      timeout: 20000,
      forceNew: false
    });
    this.initializeSocketListeners();
  }

  private initializeSocketListeners(): void {
    if (!this.socket) return;

    // Evento de conexión exitosa
    this.socket.on('connect', () => {
      console.log('[SOCKET] Conectado al servidor:', this.socket.id);
      this.conectadoSubject.next(true);
    this.socketIdSubject.next(this.socket.id ?? null);
    });

    // Evento de desconexión
    this.socket.on('disconnect', (reason: any) => {
      console.log('[SOCKET] Desconectado:', reason);
      this.conectadoSubject.next(false);
    this.socketIdSubject.next(null);
    });

    // Eventos de sala
    this.socket.on('salaCreada', (data: any) => {
      console.log('[SOCKET] Sala creada:', data);
      this.salaActualSubject.next(data.sala);
      this.jugadorActualSubject.next(data.jugador);
      this.jugadoresSubject.next(data.sala.jugadores);
    });

    this.socket.on('unidoASala', (data: any) => {
      console.log('[SOCKET] Unido a sala:', data);
      this.salaActualSubject.next(data.sala);
      this.jugadorActualSubject.next(data.jugador);
      this.jugadoresSubject.next(data.sala.jugadores);
    });

    // Eventos de jugadores
    this.socket.on('jugadorUnido', (data: any) => {
      console.log('[SOCKET] Jugador unido:', data);
      const jugadores = this.jugadoresSubject.value;
      jugadores.push(data.jugador);
      this.jugadoresSubject.next([...jugadores]);
    });

    this.socket.on('jugadorDesconectado', (data: any) => {
      console.log('[SOCKET] Jugador desconectado:', data);
      // Actualizar lista de jugadores
    });

    // Eventos de juego
    this.socket.on('juegoIniciado', (data: any) => {
      console.log('[SOCKET] Juego iniciado:', data);
      this.juegoIniciadoSubject.next(data);
    });

    this.socket.on('numeroSorteado', (data: any) => {
      console.log('[SOCKET] Número sorteado:', data);
      this.numeroSorteadoSubject.next(data);
    });

    this.socket.on('bingo', (data: any) => {
      console.log('[SOCKET] ¡BINGO!:', data);
      this.bingoSubject.next(data);
    });

    // Eventos de chat
    this.socket.on('nuevoMensaje', (mensaje: any) => {
      const mensajesActuales = this.mensajesChatSubject.value;
      this.mensajesChatSubject.next([...mensajesActuales, mensaje]);
    });

    // Eventos de error
    this.socket.on('error', (data: any) => {
      console.error('[SOCKET] Error:', data);
      this.errorSubject.next(data);
    });
  }

  /**
   * MÉTODOS PÚBLICOS PARA INTERACCIÓN CON EL SERVIDOR
   */

  /**
   * CREAR SALA DE JUEGO
   * 
   * @param nombreSala - Nombre de la sala a crear
   * @param nombreJugador - Nombre del jugador que crea la sala
   */
  crearSala(nombreSala: string, nombreJugador: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('[SOCKET] No conectado. Intentando conectar...');
      this.connect();
      // Esperamos un poco para que se establezca la conexión
      setTimeout(() => {
        if (this.socket && this.socket.connected) {
          this.socket.emit('crearSala', { nombreSala, nombreJugador });
        } else {
          console.error('[SOCKET] No se pudo establecer conexión para crear sala');
        }
      }, 1000);
      return;
    }
    this.socket.emit('crearSala', { nombreSala, nombreJugador });
  }

  /**
   * UNIRSE A SALA EXISTENTE
   * 
   * @param salaId - ID de la sala
   * @param nombreJugador - Nombre del jugador
   */
  unirseASala(salaId: string, nombreJugador: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('[SOCKET] No conectado. Intentando conectar...');
      this.connect();
      setTimeout(() => {
        if (this.socket && this.socket.connected) {
          this.socket.emit('unirseASala', { salaId, nombreJugador });
        } else {
          console.error('[SOCKET] No se pudo establecer conexión para unirse a sala');
        }
      }, 1000);
      return;
    }
    this.socket.emit('unirseASala', { salaId, nombreJugador });
  }

  /**
   * INICIAR JUEGO EN SALA
   * 
   * @param salaId - ID de la sala
   */
  iniciarJuego(salaId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('[SOCKET] No conectado. Intentando conectar...');
      this.connect();
      setTimeout(() => {
        if (this.socket && this.socket.connected) {
          this.socket.emit('iniciarJuego', { salaId });
        } else {
          console.error('[SOCKET] No se pudo establecer conexión para iniciar juego');
        }
      }, 1000);
      return;
    }
    this.socket.emit('iniciarJuego', { salaId });
  }

  /**
   * MARCAR NÚMERO EN CARTÓN
   * 
   * @param salaId - ID de la sala
   * @param jugadorId - ID del jugador
   * @param fila - Fila del cartón
   * @param columna - Columna del cartón
   */
  marcarNumero(salaId: string, jugadorId: string, fila: number, columna: number): void {
    this.socket.emit('marcarNumero', { salaId, jugadorId, fila, columna });
  }

  /**
   * ENVIAR MENSAJE DE CHAT
   * 
   * @param salaId - ID de la sala
   * @param jugadorId - ID del jugador
   * @param mensaje - Mensaje a enviar
   */
  enviarMensaje(salaId: string, jugadorId: string, mensaje: string): void {
    this.socket.emit('enviarMensaje', { salaId, jugadorId, mensaje });
  }

  /**
   * OBTENER SALAS DISPONIBLES
   * 
   * @returns Observable con las salas disponibles
   */
  obtenerSalasDisponibles(): Observable<Sala[]> {
    return new Observable(observer => {
      this.socket.emit('obtenerSalas');
      this.socket.on('salasDisponibles', (salas: Sala[]) => {
        observer.next(salas);
      });
    });
  }

  /**
   * DESCONECTAR SOCKET
   * 
   * @description Cierra la conexión WebSocket
   */
  desconectar(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /**
   * LIMPIAR ESTADO
   * 
   * @description Resetea todos los subjects al estado inicial
   */
  limpiarEstado(): void {
    this.salaActualSubject.next(null);
    this.jugadorActualSubject.next(null);
    this.jugadoresSubject.next([]);
    this.mensajesChatSubject.next([]);
  }

  /**
   * GETTERS PARA VALORES ACTUALES
   */
  get estaConectado(): boolean {
    return this.conectadoSubject.value;
  }

  get salaActual(): Sala | null {
    return this.salaActualSubject.value;
  }

  get jugadorActual(): Jugador | null {
    return this.jugadorActualSubject.value;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

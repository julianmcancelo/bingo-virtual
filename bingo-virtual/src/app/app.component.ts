/**
 * COMPONENTE PRINCIPAL BINGO VIRTUAL EDUCATIVO
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Componente Angular 17 standalone para bingo virtual
 */

import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';
import { Subscription } from 'rxjs';
import { SocketService, Jugador, Sala, MensajeChat, CeldaBingo } from './services/socket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatGridListModule,
    MatDividerModule,
    MatTabsModule,
    MatExpansionModule,
    MatListModule,
    MatSidenavModule,
    MatTooltipModule,
    MatRippleModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatStepperModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Bingo Virtual Educativo - ALED3';
  
  // Información del proyecto
  autores = 'Julián Manuel Cancelo & Nicolás Otero';
  materia = 'Algoritmos y Estructuras de Datos III';
  profesor = 'Prof. Sebastián Saldivar';
  
  // Estados básicos
  vistaActual = 'lobby';
  nombreJugador = '';
  nombreSala = '';
  salaIdUnirse = '';
  
  // Cartón de bingo
  carton: CeldaBingo[][] = [];
  
  // Estado del juego
  juegoIniciado = false;
  numerosSorteados: number[] = [];
  numeroActual: number | null = null;
  hayBingo = false;
  totalSorteados = 0;
  
  // Estado multijugador
  salaActual: Sala | null = null;
  jugadorActual: Jugador | null = null;
  jugadores: Jugador[] = [];
  
  // Chat
  mensajesChat: MensajeChat[] = [];
  nuevoMensaje = '';
  
  // Subscripciones
  private subscriptions: Subscription[] = [];
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  
  
  constructor(
    private socketService: SocketService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Inicialización básica sin operaciones pesadas
  }

  /**
   * CICLO DE VIDA ANGULAR
   */
  ngOnInit(): void {
    console.log('Angular component initialized');

    if (isPlatformBrowser(this.platformId)) {
      console.log('Running on the browser, initializing features...');
      this.synth = window.speechSynthesis;
      this.loadVoices();
      this.socketService.connect(); // Conectar manualmente
    } else {
      console.log('Running on the server, skipping browser-specific features.');
    }

    this.generarCarton();
    this.configurarSocketIO();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.socketService.desconectar();
  }

  /**
   * CONFIGURACIÓN DE SOCKET.IO
   */
  private configurarSocketIO(): void {
    // Suscribirse al estado de conexión
    this.subscriptions.push(
      this.socketService.conectado$.subscribe(conectado => {
        console.log('Estado de conexión:', conectado);
      })
    );

    // Suscribirse a eventos de sala
    this.subscriptions.push(
      this.socketService.salaActual$.subscribe(sala => {
        this.salaActual = sala;
        if (sala) {
          this.vistaActual = 'sala';
          console.log('Sala actual:', sala);
        }
      })
    );

    // Suscribirse a jugador actual
    this.subscriptions.push(
      this.socketService.jugadorActual$.subscribe(jugador => {
        this.jugadorActual = jugador;
        if (jugador && jugador.carton) {
          this.carton = jugador.carton;
        }
        console.log('Jugador actual:', jugador);
      })
    );

    // Suscribirse a lista de jugadores
    this.subscriptions.push(
      this.socketService.jugadores$.subscribe(jugadores => {
        this.jugadores = jugadores;
        console.log('Jugadores en sala:', jugadores);
      })
    );

    // Suscribirse a números sorteados
    this.subscriptions.push(
      this.socketService.numeroSorteado$.subscribe(data => {
        this.numeroActual = data.numero;
        this.numerosSorteados = data.numerosSorteados;
        this.totalSorteados = data.totalSorteados;
        console.log('Número sorteado:', data.numero);
        this.narrarNumero(data.numero);
      })
    );

    // Suscribirse a eventos de juego iniciado
    this.subscriptions.push(
      this.socketService.juegoIniciado$.subscribe(data => {
        this.juegoIniciado = true;
        this.vistaActual = 'juego';
        console.log('Juego iniciado:', data);
      })
    );

    // Suscribirse a eventos de bingo
    this.subscriptions.push(
      this.socketService.bingo$.subscribe(evento => {
        this.hayBingo = true;
        console.log('¡BINGO!:', evento);
      })
    );

    // Suscribirse a errores
    this.subscriptions.push(
      this.socketService.error$.subscribe(error => {
        console.error('Error del servidor:', error);
        alert('Error: ' + error.mensaje);
      })
    );

    // Suscribirse a mensajes de chat
    this.suscribirseAChat();
  }

  /**
   * MÉTODOS DE GESTIÓN DE SALAS
   */
  
  /**
   * Crear nueva sala de juego
   */
  crearSala(): void {
    if (!this.nombreSala.trim() || !this.nombreJugador.trim()) {
      alert('Por favor, completa todos los campos');
      return;
    }
    
    this.socketService.crearSala(this.nombreSala, this.nombreJugador);
  }

  /**
   * Unirse a sala existente
   */
  unirseASala(): void {
    if (!this.nombreJugador.trim() || !this.salaIdUnirse.trim()) {
      alert('Por favor, completa todos los campos');
      return;
    }
    
    this.socketService.unirseASala(this.salaIdUnirse, this.nombreJugador);
  }

  /**
   * Iniciar juego en la sala actual
   */
  iniciarJuegoMultijugador(): void {
    if (this.salaActual) {
      this.socketService.iniciarJuego(this.salaActual.id);
    }
  }

  /**
   * Volver al lobby
   */
  volverAlLobby(): void {
    this.vistaActual = 'lobby';
    this.salaActual = null;
    this.jugadorActual = null;
    this.jugadores = [];
    this.juegoIniciado = false;
    this.hayBingo = false;
    this.numeroActual = null;
    this.numerosSorteados = [];
    this.totalSorteados = 0;
    this.mensajesChat = [];
    this.nuevoMensaje = '';
    this.socketService.limpiarEstado();
  }

  /**
   * MÉTODOS DE JUEGO
   */

  /**
   * Generar cartón de bingo
   */
  generarCarton(): void {
    this.carton = [];
    const rangos = [
      { min: 1, max: 15 },   // B
      { min: 16, max: 30 },  // I
      { min: 31, max: 45 },  // N
      { min: 46, max: 60 },  // G
      { min: 61, max: 75 }   // O
    ];

    // Generar números únicos por columna
    const numerosUsados: Set<number>[] = [new Set(), new Set(), new Set(), new Set(), new Set()];

    for (let fila = 0; fila < 5; fila++) {
      this.carton[fila] = [];
      for (let columna = 0; columna < 5; columna++) {
        if (fila === 2 && columna === 2) {
          // Espacio libre en el centro
          this.carton[fila][columna] = {
            numero: 0,
            marcada: true,
            esLibre: true
          };
        } else {
          let numero: number;
          let intentos = 0;
          const rango = rangos[columna];
          
          do {
            numero = Math.floor(Math.random() * (rango.max - rango.min + 1)) + rango.min;
            intentos++;
            // Prevenir bucle infinito
            if (intentos > 50) {
              numero = rango.min + numerosUsados[columna].size;
              break;
            }
          } while (numerosUsados[columna].has(numero));

          numerosUsados[columna].add(numero);
          this.carton[fila][columna] = {
            numero: numero,
            marcada: false,
            esLibre: false
          };
        }
      }
    }
  }


  /**
   * Marcar/desmarcar celda del cartón
   */
  toggleCelda(fila: number, columna: number): void {
    if (!this.juegoIniciado || !this.carton[fila] || !this.carton[fila][columna] || this.carton[fila][columna].esLibre) {
      return;
    }

    const numero = this.carton[fila][columna].numero;
    if (this.numerosSorteados.includes(numero)) {
      this.carton[fila][columna].marcada = !this.carton[fila][columna].marcada;
      
      // Enviar marcado al servidor
      if (this.salaActual && this.jugadorActual) {
        this.socketService.marcarNumero(this.salaActual.id, this.jugadorActual.id, fila, columna);
      }
      
      // Verificar bingo después de marcar
      if (this.verificarBingo()) {
        this.hayBingo = true;
        if (this.salaActual && this.jugadorActual) {
          // Notificar bingo al servidor
          console.log('¡BINGO detectado!');
        }
      }
    }
  }

  /**
   * Verificar si un número está disponible para marcar
   */
  numeroDisponible(numero: number): boolean {
    return this.numerosSorteados.includes(numero);
  }

  /**
   * Verificar si es el número actual
   */
  esNumeroActual(numero: number): boolean {
    return this.numeroActual === numero;
  }

  /**
   * Verificar bingo
   */
  verificarBingo(): boolean {
    // Verificar filas
    for (let fila = 0; fila < 5; fila++) {
      if (this.carton[fila].every(celda => celda.marcada)) {
        return true;
      }
    }

    // Verificar columnas
    for (let columna = 0; columna < 5; columna++) {
      if (this.carton.every(fila => fila[columna].marcada)) {
        return true;
      }
    }

    // Verificar diagonales
    if (this.carton.every((fila, index) => fila[index].marcada)) {
      return true;
    }

    if (this.carton.every((fila, index) => fila[4 - index].marcada)) {
      return true;
    }

    return false;
  }

  /**
   * Obtener tooltip para celda
   */
  getCellTooltip(celda: CeldaBingo, fila: number, columna: number): string {
    if (!celda) {
      return 'Celda no válida';
    }

    if (celda.esLibre) {
      return 'Espacio libre';
    }

    if (celda.marcada) {
      return `Número ${celda.numero} - Marcado`;
    }

    if (this.numeroActual === celda.numero) {
      return `Número ${celda.numero} - ¡Número actual!`;
    }

    if (this.numerosSorteados.includes(celda.numero)) {
      return `Número ${celda.numero} - Disponible para marcar`;
    }

    return `Número ${celda.numero} - No sorteado`;
  }

  /**
   * MÉTODOS DE CHAT
   */

  /**
   * Enviar mensaje de chat
   */
  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim() || !this.salaActual || !this.jugadorActual) {
      return;
    }

    this.socketService.enviarMensaje(this.salaActual.id, this.jugadorActual.id, this.nuevoMensaje);
    this.nuevoMensaje = '';
  }

  /**
   * Manejar Enter en chat
   */
  onEnterChat(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  /**
   * MÉTODOS AUXILIARES
   */

  /**
   * Obtener letra de columna
   */
  getLetraColumna(columna: number): string {
    return ['B', 'I', 'N', 'G', 'O'][columna];
  }

  /**
   * Formatear tiempo
   */
  formatearTiempo(fecha: Date): string {
    return fecha.toLocaleTimeString();
  }

  /**
   * GETTERS
   */

  get estaConectado(): boolean {
    return this.socketService.estaConectado;
  }

  get esCreadorSala(): boolean {
    return this.salaActual?.jugadores[0]?.id === this.jugadorActual?.id;
  }

  get progresoJuego(): number {
    return Math.round((this.totalSorteados / 75) * 100);
  }

  get numerosMarcados(): number {
    let count = 0;
    this.carton.forEach(fila => {
      fila.forEach(celda => {
        if (celda.marcada && !celda.esLibre) {
          count++;
        }
      });
    });
    return count;
  }

  get puedeIniciarJuego(): boolean {
    return this.esCreadorSala && this.jugadores.length >= 1 && !this.juegoIniciado;
  }

  /**
   * Suscribirse a mensajes de chat
   */
  private suscribirseAChat(): void {
    this.subscriptions.push(
      this.socketService.mensajesChat$.subscribe(mensajes => {
        this.mensajesChat = mensajes;
        console.log('Mensajes de chat actualizados:', mensajes);
      })
    );
  }

  /**
   * Reiniciar estado local del componente
   */
  /**
   * NARRAR NÚMERO CON SÍNTESIS DE VOZ
   */
  private loadVoices(): void {
    if (this.synth) {
      this.voices = this.synth.getVoices();
      if (this.voices.length === 0) {
        this.synth.onvoiceschanged = () => {
          this.voices = this.synth!.getVoices();
          console.log('Voces de narración cargadas:', this.voices.length);
        };
      }
    }
  }

  private narrarNumero(numero: number): void {
    if (this.synth) {
      this.synth.cancel(); // Cancelar narraciones anteriores
      const utterance = new SpeechSynthesisUtterance(`${numero}`);
      utterance.voice = this.voices.find(voice => voice.lang.startsWith('es')) || this.voices[0];
      utterance.pitch = 1.2;
      utterance.rate = 1.1;
      this.synth.speak(utterance);
    } else {
      console.warn('La síntesis de voz no está disponible.');
    }
  }

  private reiniciarEstadoLocal(): void {
    this.nombreJugador = '';
    this.nombreSala = '';
    this.salaIdUnirse = '';
    this.juegoIniciado = false;
    this.hayBingo = false;
    this.numeroActual = null;
    this.numerosSorteados = [];
    this.totalSorteados = 0;
    this.mensajesChat = [];
    this.nuevoMensaje = '';
    this.generarCarton();
  }

  /**
   * Mostrar notificación al usuario
   */
  mostrarNotificacion(mensaje: string, tipo: 'success' | 'warning' | 'error' = 'success'): void {
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    // Aquí se podría integrar con MatSnackBar en el futuro
  }
}

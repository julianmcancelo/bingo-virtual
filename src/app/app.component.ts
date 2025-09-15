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
import Swal from 'sweetalert2';
import { environment } from '../environments/environment';
import { SocketService, Jugador, Sala, MensajeChat, CeldaBingo } from './services/socket.service';
import { SettingsService, GameSettings } from './services/settings.service';
import { LobbyComponent } from './components/lobby/lobby.component';
import { SalaComponent } from './components/sala/sala.component';
import { JuegoComponent } from './components/juego/juego.component';
import { LoginComponent } from './components/login/login.component';

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
    MatStepperModule,
    LoginComponent,
    LobbyComponent,
    SalaComponent,
    JuegoComponent
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
  vistaActual = 'login'; // Vista inicial es ahora el login
  salaIdUnirse = '';
  nombreJugadorInvitado: string = '';
  
  // Cartón de bingo
  carton: CeldaBingo[][] = [];
  gameSettings!: GameSettings;
  
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
  
  // Subscripciones
  private subscriptions: Subscription[] = [];
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  
  
  constructor(
    public socketService: SocketService,
    private settingsService: SettingsService,
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
    // Las suscripciones para el estado de la conexión y el socketId se manejarán
    // directamente en la plantilla con el pipe async o se leerán con getValue() en el modal.
    // Mantenemos las suscripciones que sí ejecutan lógica en el componente.

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
        Swal.fire({
          title: 'Error',
          text: error.mensaje,
          icon: 'error',
          confirmButtonColor: 'var(--itb-accent-blue)',
          confirmButtonText: 'Cerrar'
        });
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
  loginComoInvitado(nombre: string): void {
    this.nombreJugadorInvitado = nombre;
    this.vistaActual = 'lobby';
  }

  crearSala(event: { nombreSala: string, nombreJugador: string }): void {
    this.socketService.crearSala(event.nombreSala, event.nombreJugador);
  }

  /**
   * Unirse a sala existente
   */
  unirseASala(event: { salaId: string, nombreJugador: string }): void {
    this.socketService.unirseASala(event.salaId, event.nombreJugador);
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
  toggleCelda(event: { fila: number, columna: number }): void {
    const { fila, columna } = event;
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
    if (!this.carton || this.carton.length === 0) return false;

    // Para el bingo argentino, verificamos si se completó una línea (fila)
    for (let i = 0; i < this.carton.length; i++) {
      const fila = this.carton[i];
      const numerosEnFila = fila.filter(celda => celda && celda.numero !== null);
      if (numerosEnFila.length > 0 && numerosEnFila.every(celda => celda.marcada)) {
        return true;
      }
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
  enviarMensaje(mensaje: string): void {
    if (!mensaje.trim() || !this.salaActual || !this.jugadorActual) {
      return;
    }
    this.socketService.enviarMensaje(this.salaActual.id, this.jugadorActual.id, mensaje);
  }

  /**
   * Manejar Enter en chat
   */

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
    this.salaIdUnirse = '';
    this.juegoIniciado = false;
    this.hayBingo = false;
    this.numeroActual = null;
    this.numerosSorteados = [];
    this.totalSorteados = 0;
    this.mensajesChat = [];
    this.generarCarton();
  }

  /**
   * Mostrar notificación al usuario
   */
    mostrarEstadoServidor(): void {
    const serverUrl = environment.serverUrl;
    // Usamos los observables públicos directamente en lugar de propiedades locales
    const isConnected = this.socketService.conectado$.getValue();
    const socketId = this.socketService.socketId$.getValue();

    const estadoIcon = isConnected ? '✅' : '❌';
    const estadoTexto = isConnected ? 'Conectado' : 'Desconectado';
    const estadoColor = isConnected ? 'text-green-600' : 'text-red-600';

    Swal.fire({
      title: 'Estado de la Conexión',
      html: `
        <div class="text-left text-gray-700 space-y-3 p-4 border rounded-lg bg-gray-50">
          <div class="flex justify-between items-center">
            <span class="font-semibold">Estado:</span>
            <span class="font-bold ${estadoColor}">${estadoIcon} ${estadoTexto}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-semibold">Servidor:</span>
            <span class="text-sm font-mono bg-gray-200 px-2 py-1 rounded">${serverUrl}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-semibold">ID de Sesión:</span>
            <span class="text-xs font-mono bg-gray-200 px-2 py-1 rounded">${socketId || 'N/A'}</span>
          </div>
        </div>
      `,
      icon: isConnected ? 'success' : 'error',
      confirmButtonColor: 'var(--itb-accent-blue)',
      confirmButtonText: 'Entendido'
    });
  }

    mostrarAjustes(): void {
    Swal.fire({
      title: 'Ajustes del Juego',
      html: `
        <div class="text-left space-y-4 p-4">
          <div class="flex items-center justify-between">
            <label for="swal-marcado-automatico" class="text-gray-700 font-medium">Marcado Automático</label>
            <input type="checkbox" id="swal-marcado-automatico" class="swal2-checkbox h-6 w-6 text-blue-600" ${this.gameSettings.marcadoAutomatico ? 'checked' : ''}>
          </div>
          <div class="flex items-center justify-between">
            <label for="swal-narrador" class="text-gray-700 font-medium">Habilitar Narrador</label>
            <input type="checkbox" id="swal-narrador" class="swal2-checkbox h-6 w-6" ${this.gameSettings.narradorHabilitado ? 'checked' : ''}>
          </div>
        </div>
      `,
      confirmButtonText: 'Guardar Cambios',
      confirmButtonColor: 'var(--itb-accent-blue)',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const marcadoAutomatico = (document.getElementById('swal-marcado-automatico') as HTMLInputElement).checked;
        const narradorHabilitado = (document.getElementById('swal-narrador') as HTMLInputElement).checked;
        this.settingsService.updateSettings({ marcadoAutomatico, narradorHabilitado });
      }
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire('¡Guardado!', 'Tus ajustes han sido actualizados.', 'success');
      }
    });
  }

  mostrarInfoProyecto(): void {
    Swal.fire({
      title: 'Bingo Virtual Educativo',
      html: `
        <div class="text-left text-gray-700 space-y-5 p-2">

          <!-- Cátedra -->
          <div class="p-3 border rounded-lg bg-gray-50">
            <h3 class="font-semibold text-lg text-[var(--itb-dark-blue)] flex items-center gap-2 mb-2">
              <span class="text-xl">🎓</span> Cátedra
            </h3>
            <p class="text-sm"><strong>Materia:</strong> ${this.materia}</p>
            <p class="text-sm"><strong>Profesor:</strong> ${this.profesor}</p>
          </div>

          <!-- Equipo -->
          <div class="p-3 border rounded-lg bg-gray-50">
            <h3 class="font-semibold text-lg text-[var(--itb-dark-blue)] flex items-center gap-2 mb-2">
              <span class="text-xl">👨‍💻</span> Equipo de Desarrollo
            </h3>
            <p class="text-sm">${this.autores}</p>
          </div>

          <!-- Tecnologías -->
          <div class="p-3 border rounded-lg bg-gray-50">
            <h3 class="font-semibold text-lg text-[var(--itb-dark-blue)] flex items-center gap-2 mb-2">
              <span class="text-xl">🛠️</span> Stack Tecnológico
            </h3>
            <ul class="text-sm space-y-1 pl-1">
              <li><strong>Frontend:</strong> Angular 17</li>
              <li><strong>Backend:</strong> Node.js, Express, Socket.IO</li>
              <li><strong>Estilos:</strong> Tailwind CSS & Angular Material</li>
              <li><strong>Alertas:</strong> SweetAlert2</li>
              <li><strong>DevOps:</strong> Concurrently (para ejecución paralela)</li>
            </ul>
          </div>

        </div>
      `,
      width: '550px',
      showCloseButton: true,
      confirmButtonColor: 'var(--itb-accent-blue)',
      confirmButtonText: 'Cerrar'
    });
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'warning' | 'error' = 'success'): void {
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    // Aquí se podría integrar con MatSnackBar en el futuro
  }
}

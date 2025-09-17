/**
 * COMPONENTE DEL JUEGO DE BINGO
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Componente principal del juego de bingo
 */

import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { SocketService, Jugador, Sala, CeldaBingo } from '../../services/socket.service';
import { SettingsService } from '../../services/settings.service';
import { ChatFlotanteComponent } from '../shared/chat-flotante/chat-flotante.component';
import { environment } from '../../../environments/environment';

// Importaciones dinámicas de componentes
import { LoginComponent } from '../login/login.component';
import { LobbyComponent } from '../lobby/lobby.component';
import { SalaComponent } from '../sala/sala.component';
import { JuegoComponent } from '../juego/juego.component';

@Component({
  selector: 'app-bingo-game',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatDialogModule,
    RouterLink,
    LobbyComponent,
    SalaComponent,
    JuegoComponent,
    LoginComponent,
    ChatFlotanteComponent
  ],
  template: `
    <div class="min-h-screen bg-[var(--background-light-gray)] flex flex-col">
      <!-- Header -->
      <header class="bg-[var(--itb-dark-blue)] text-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div class="flex items-center gap-4">
            <a routerLink="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="assets/img/logo.png" alt="Logo" class="h-10 w-auto">
              <h1 class="text-xl sm:text-2xl font-bold hidden sm:block">Bingo Virtual Educativo</h1>
            </a>
          </div>
          <div class="flex items-center gap-4">
            <nav class="hidden md:flex items-center gap-4">
              <a routerLink="/" class="px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded-md transition-colors" 
                 [class.bg-blue-800]="router.url === '/'">
                Inicio
              </a>
              <a [routerLink]="['/bingo']" 
                 class="px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded-md transition-colors"
                 [class.bg-blue-800]="router.url.startsWith('/bingo')">
                Jugar
              </a>
              <a [routerLink]="['/estadisticas']" 
                 class="px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded-md transition-colors"
                 [class.bg-blue-800]="router.url.startsWith('/estadisticas')">
                Estadísticas
              </a>
            </nav>
            
            <div class="flex items-center gap-4 text-xs sm:text-sm">
              <p *ngIf="socketService.conectado$ | async as isConnected" class="hidden sm:block">
                <strong>Conexión:</strong>
                <span [ngClass]="{'text-green-400': isConnected, 'text-red-400': !isConnected}" class="font-semibold ml-1">
                  {{ isConnected ? 'Conectado' : 'Desconectado' }}
                </span>
              </p>
              <span *ngIf="socketService.conectado$ | async as isConnected" class="sm:hidden">
                {{ isConnected ? 'Conectado' : 'Desconectado' }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div class="w-full max-w-2xl mx-auto relative">
          <!-- Victory Overlay -->
          <div *ngIf="hayBingo" class="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 rounded-xl animate-fade-in">
            <h2 class="text-6xl font-bold text-[var(--itb-accent-blue)] animate-pulse">¡LÍNEA!</h2>
            <p class="text-2xl text-white mt-4">¡Felicidades al ganador!</p>
            <button (click)="volverAlLobby()" class="mt-8 px-6 py-3 bg-[var(--itb-accent-blue)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">Jugar de Nuevo</button>
          </div>

          <!-- Dynamic View Container -->
          <ng-container [ngSwitch]="vistaActual">
            <app-login *ngSwitchCase="'login'" (loginComoInvitado)="loginComoInvitado($event)"></app-login>
            <app-lobby *ngSwitchCase="'lobby'" [nombreJugador]="nombreJugadorInvitado" (crearSalaEvent)="crearSala($event)" (unirseASalaEvent)="unirseASala($event.salaId)"></app-lobby>
            <app-sala *ngSwitchCase="'sala'"
                      [salaActual]="salaActual"
                      [jugadorActual]="jugadorActual"
                      [jugadores]="jugadores"
                      [mensajesChat]="mensajesChat"
                      (iniciarJuegoEvent)="iniciarJuegoMultijugador()"
                      (volverAlLobbyEvent)="volverAlLobby()"
                      (enviarMensajeEvent)="enviarMensaje($event)">
            </app-sala>
            <app-juego *ngSwitchCase="'juego'"
                       [jugadorActual]="jugadorActual"
                       [carton]="carton"
                       [numeroActual]="numeroActual"
                       [numerosSorteados]="numerosSorteados"
                       (toggleCeldaEvent)="toggleCelda($event)">
            </app-juego>
          </ng-container>
        </div>
      </main>

      <!-- Floating Action Buttons -->
      <div class="fixed bottom-6 left-6 z-40 flex flex-col gap-4">
        
        <!-- Menu Button -->
        <button mat-fab color="primary" [matMenuTriggerFor]="mainMenu" matTooltip="Opciones">
          <mat-icon>menu</mat-icon>
        </button>

        <mat-menu #mainMenu="matMenu" xPosition="before">
          <button mat-menu-item (click)="mostrarEstadoServidor()">
            <mat-icon>cloud_queue</mat-icon>
            <span>Estado del Servidor</span>
          </button>
          <button mat-menu-item (click)="mostrarAjustes()">
            <mat-icon>settings</mat-icon>
            <span>Ajustes del Juego</span>
          </button>
          <button mat-menu-item (click)="mostrarEstadisticas()">
            <mat-icon>bar_chart</mat-icon>
            <span>Estadísticas</span>
          </button>
          <button mat-menu-item (click)="mostrarAyuda()">
            <mat-icon>help_outline</mat-icon>
            <span>Cómo Jugar</span>
          </button>
          <button mat-menu-item (click)="cambiarTema()">
            <mat-icon>palette</mat-icon>
            <span>Cambiar Tema</span>
          </button>
          <button mat-menu-item (click)="mostrarInfoProyecto()">
            <mat-icon>info_outline</mat-icon>
            <span>Info del Proyecto</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="volverAlLobby()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Salir del Juego</span>
          </button>
        </mat-menu>
      </div>

      <!-- Chat Flotante -->
      <app-chat-flotante 
        *ngIf="salaActual && jugadorActual"
        [salaId]="salaActual.id"
        [jugadorActual]="jugadorActual"
        [posicion]="'bottom-left'">
      </app-chat-flotante>
    </div>
  `,
  styles: [`
    .glow-border {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }
    
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class BingoGameComponent implements OnInit, OnDestroy {
  // Servicios inyectados
  constructor(
    public socketService: SocketService,
    private settingsService: SettingsService,
    public router: Router,
    private snackBar: MatSnackBar,
    private viewContainer: ViewContainerRef,
    private dialog: MatDialog
  ) {}

  // Estado del juego
  vistaActual: 'login' | 'lobby' | 'sala' | 'juego' = 'login';
  
  // Datos del jugador
  nombreJugadorInvitado: string = '';
  jugadorActual: Jugador | null = null;
  
  // Datos de la sala
  salaActual: Sala | null = null;
  jugadores: Jugador[] = [];
  mensajesChat: any[] = [];
  
  // Observables
  salaActual$ = this.socketService.salaActual$;
  jugadorActual$ = this.socketService.jugadorActual$;
  jugadores$ = this.socketService.jugadores$;
  mensajesChat$ = this.socketService.mensajesChat$;
  
  // Estado del juego
  hayBingo: boolean = false;
  numeroActual: number | null = null;
  numerosSorteados: number[] = [];
  carton: CeldaBingo[][] = [];
  
  // Control de eventos únicos por juego
  lineaYaCantada: boolean = false;
  dobleLineaYaCantada: boolean = false;
  bingoYaCantado: boolean = false;
  
  // Chat (removido - ahora manejado por ChatService)
  
  // Suscripciones
  private suscripciones: Subscription[] = [];

  ngOnInit(): void {
    // Conectar al servidor Socket.IO al inicializar el componente
    this.socketService.connect();
    
    // Suscribirse a eventos específicos
    this.suscripciones.push(
      this.socketService.salaActual$.subscribe(sala => {
        this.salaActual = sala;
      })
    );
    
    this.suscripciones.push(
      this.socketService.jugadorActual$.subscribe((jugador: Jugador | null) => {
        this.jugadorActual = jugador;
      })
    );
    
    this.suscripciones.push(
      this.socketService.jugadores$.subscribe(jugadores => {
        this.jugadores = jugadores;
      })
    );
    
    this.suscripciones.push(
      this.socketService.mensajesChat$.subscribe((mensajes: any[]) => {
        this.mensajesChat = mensajes;
      })
    );

    // Suscribirse a eventos del juego
    this.suscripciones.push(
      this.socketService.numeroSorteado$.subscribe((data: any) => {
        if (data && data.numero) {
          this.numeroActual = data.numero;
          this.numerosSorteados = data.numerosSorteados || [];
          console.log('[BINGO-GAME] Número actualizado:', this.numeroActual, 'Total sorteados:', this.numerosSorteados.length);
          
          // Verificar si el marcado automático está habilitado
          this.settingsService.settings$.subscribe(settings => {
            if (settings.marcadoAutomatico) {
              this.marcarAutomaticamente(data.numero);
            }
          }).unsubscribe(); // Unsubscribe inmediatamente para evitar memory leaks
        }
      })
    );

    this.suscripciones.push(
      this.socketService.juegoIniciado$.subscribe((data: any) => {
        if (data) {
          this.vistaActual = 'juego';
          this.generarCarton();
          // Resetear también el estado de números sorteados
          this.numerosSorteados = [];
          this.numeroActual = null;
          console.log('[BINGO-GAME] Juego iniciado, cartón generado, estado reseteado');
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(sub => sub.unsubscribe());
  }

  // Métodos del juego
  loginComoInvitado(nombre: string): void {
    this.nombreJugadorInvitado = nombre;
    this.vistaActual = 'lobby';
  }

  crearSala(configuracion: { nombreSala: string, nombreJugador: string }): void {
    this.socketService.crearSala(configuracion.nombreSala, configuracion.nombreJugador);
    this.vistaActual = 'sala';
  }

  unirseASala(codigoSala: string): void {
    this.socketService.unirseASala(codigoSala, this.nombreJugadorInvitado);
    this.vistaActual = 'sala';
  }

  iniciarJuegoMultijugador(): void {
    if (this.salaActual) {
      this.socketService.iniciarJuego(this.salaActual.id);
      this.vistaActual = 'juego';
    }
  }

  volverAlLobby(): void {
    this.hayBingo = false;
    this.vistaActual = 'lobby';
    // Reset game state
    this.salaActual = null;
    this.jugadorActual = null;
    this.jugadores = [];
  }

  // Generar cartón de bingo oficial (3x9 con 5 números por fila)
  generarCarton(): void {
    this.carton = [];
    
    // Resetear flags de eventos únicos al generar nuevo cartón
    this.lineaYaCantada = false;
    this.dobleLineaYaCantada = false;
    this.bingoYaCantado = false;
    this.hayBingo = false;
    
    // Generar números disponibles por columna (1-90 total)
    const numerosPorColumna: number[][] = [];
    for (let col = 0; col < 9; col++) {
      const numeros: number[] = [];
      let min: number, max: number;
      
      if (col === 0) {
        min = 1; max = 10;  // Columna 1: 1-10 (10 números)
      } else if (col === 8) {
        min = 81; max = 90; // Columna 9: 81-90 (10 números)
      } else {
        min = (col * 10) + 1; // Columnas 2-8: 11-20, 21-30, ..., 71-80
        max = (col + 1) * 10;
      }
      
      for (let num = min; num <= max; num++) {
        numeros.push(num);
      }
      numerosPorColumna.push(this.shuffleArray([...numeros]));
    }

    // Crear 3 filas
    for (let fila = 0; fila < 3; fila++) {
      const filaCarton: CeldaBingo[] = [];
      
      // Seleccionar 5 columnas aleatorias para tener números
      const columnasConNumeros = this.shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 5).sort();
      
      for (let col = 0; col < 9; col++) {
        if (columnasConNumeros.includes(col)) {
          // Celda con número
          const numero = numerosPorColumna[col].pop() || 1;
          filaCarton.push({
            numero: numero,
            marcada: false,
            esLibre: false
          });
        } else {
          // Celda vacía
          filaCarton.push({
            numero: null,
            marcada: false,
            esLibre: true
          });
        }
      }
      
      this.carton.push(filaCarton);
    }
    
    console.log('[BINGO-GAME] Cartón oficial generado:', this.carton);
  }

  // Función auxiliar para mezclar arrays
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  toggleCelda(event: { fila: number; columna: number }): void {
    if (this.hayBingo) return; // No permitir cambios si ya hay bingo
    if (!this.carton[event.fila] || !this.carton[event.fila][event.columna]) return;
    
    const celda = this.carton[event.fila][event.columna];
    if (celda && !celda.esLibre && celda.numero) {
      // Si ya está marcada, no permitir desmarcar
      if (celda.marcada) {
        this.snackBar.open('No puedes desmarcar un número ya marcado', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        return;
      }
      
      // Si el número no ha salido, mostrar notificación
      if (!this.numerosSorteados.includes(celda.numero)) {
        this.snackBar.open(`El número ${celda.numero} aún no ha salido`, 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        return;
      }
      
      // Solo marcar si el número ha salido y no está marcado
      celda.marcada = true;
      console.log('[BINGO-GAME] Celda marcada:', celda.numero);
      this.verificarCondicionesGanadoras();
    }
  }

  private verificarCondicionesGanadoras(): void {
    const lineasCompletas = this.contarLineasCompletas();
    const totalNumerosMarcados = this.contarNumerosMarcados();
    
    if (totalNumerosMarcados === 15 && !this.bingoYaCantado) {
      // BINGO - Cartón completo (solo una vez por juego)
      this.hayBingo = true;
      this.bingoYaCantado = true;
      this.mostrarNotificacionBingo('¡BINGO!', 'Has completado todo el cartón. ¡Felicidades!', true);
    } else if (lineasCompletas === 2 && !this.dobleLineaYaCantada) {
      // Doble línea (solo una vez por juego)
      this.dobleLineaYaCantada = true;
      this.mostrarNotificacionBingo('¡DOBLE LÍNEA!', 'Has completado dos líneas. ¡Sigue así!', false);
    } else if (lineasCompletas === 1 && !this.lineaYaCantada) {
      // Línea simple (solo una vez por juego)
      this.lineaYaCantada = true;
      this.mostrarNotificacionBingo('¡LÍNEA!', 'Has completado una línea. ¡Continúa jugando!', false);
    }
  }

  private contarLineasCompletas(): number {
    let lineasCompletas = 0;
    
    // Verificar líneas horizontales (solo números, no celdas vacías)
    for (let i = 0; i < this.carton.length; i++) {
      const numerosEnFila = this.carton[i].filter(celda => !celda.esLibre);
      const numerosMarcadosEnFila = numerosEnFila.filter(celda => celda.marcada);
      
      if (numerosEnFila.length === numerosMarcadosEnFila.length && numerosEnFila.length === 5) {
        lineasCompletas++;
      }
    }
    
    return lineasCompletas;
  }

  private contarNumerosMarcados(): number {
    let total = 0;
    for (let i = 0; i < this.carton.length; i++) {
      for (let j = 0; j < this.carton[i].length; j++) {
        const celda = this.carton[i][j];
        if (!celda.esLibre && celda.marcada) {
          total++;
        }
      }
    }
    return total;
  }

  private mostrarNotificacionBingo(titulo: string, mensaje: string, esBingo: boolean): void {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: esBingo ? 'success' : 'info',
      confirmButtonText: esBingo ? 'Jugar de Nuevo' : 'Continuar',
      allowOutsideClick: !esBingo,
      allowEscapeKey: !esBingo
    }).then((result) => {
      if (esBingo && result.isConfirmed) {
        this.volverAlLobby();
      }
    });
  }

  // Métodos del chat (removidos - ahora manejados por ChatFlotanteComponent)

  // Métodos del menú
  mostrarEstadoServidor(): void {
    const conectado = this.socketService.conectado$.value;
    const socketConnected = this.socketService.socket?.connected || false;
    const socketExists = !!this.socketService.socket;
    const serverUrl = environment.serverUrl;
    
    Swal.fire({
      title: 'Estado del Servidor',
      html: `
        <div class="text-left">
          <p><strong>Conexión Socket:</strong> ${conectado ? 'Conectado' : 'Desconectado'}</p>
          <p><strong>Socket Real:</strong> ${socketConnected ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Socket Existe:</strong> ${socketExists ? 'Sí' : 'No'}</p>
          <p><strong>URL:</strong> <a href="${serverUrl}" target="_blank" style="color: #4f46e5;">${serverUrl}</a></p>
          <p><strong>Plataforma:</strong> Render.com</p>
          <p><strong>Estado:</strong> ${conectado && socketConnected ? 'En línea' : 'Fuera de línea'}</p>
          <p><strong>Socket ID:</strong> ${this.socketService.socket?.id || 'No disponible'}</p>
          <p><strong>Jugador:</strong> ${this.jugadorActual?.nombre || this.nombreJugadorInvitado || 'No identificado'}</p>
        </div>
      `,
      icon: (conectado && socketConnected) ? 'success' : 'error',
      confirmButtonText: 'Cerrar',
      footer: '<small>Servidor desplegado en Render - Bingo Virtual ALED3</small>'
    });
  }

  mostrarAjustes(): void {
    this.settingsService.settings$.subscribe((settings: any) => {
      const configuracion = settings;
      Swal.fire({
        title: 'Ajustes del Juego',
        html: `
          <div class="text-left space-y-4">
            <div>
              <p><strong>Información del Juego:</strong></p>
              <p>• Números: 1 - 90</p>
              <p>• Modo: Multijugador en tiempo real</p>
              <p>• Tecnología: Socket.IO WebSockets</p>
            </div>
            
            <hr style="margin: 15px 0;">
            
            <div>
              <p><strong>Configuraciones:</strong></p>
              <div style="margin: 10px 0;">
                <label style="display: flex; align-items: center; gap: 10px;">
                  <input type="checkbox" id="narradorToggle" ${configuracion.narradorHabilitado ? 'checked' : ''}>
                  <span>Narrador de números activado</span>
                </label>
              </div>
              <div style="margin: 10px 0;">
                <label style="display: flex; align-items: center; gap: 10px;">
                  <input type="checkbox" id="marcadoToggle" ${configuracion.marcadoAutomatico ? 'checked' : ''}>
                  <span>Marcado automático de números</span>
                </label>
              </div>
            </div>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Guardar Cambios',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const narradorCheckbox = document.getElementById('narradorToggle') as HTMLInputElement;
          const marcadoCheckbox = document.getElementById('marcadoToggle') as HTMLInputElement;
          
          return {
            narradorHabilitado: narradorCheckbox?.checked || false,
            marcadoAutomatico: marcadoCheckbox?.checked || false
          };
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          this.settingsService.updateSettings(result.value);
          this.snackBar.open('Configuración guardada', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
      });
    });
  }

  mostrarInfoProyecto(): void {
    Swal.fire({
      title: 'Bingo Virtual Educativo',
      html: `
        <div class="text-left">
          <p><strong>Autores:</strong> Julián Manuel Cancelo & Nicolás Otero</p>
          <p><strong>Materia:</strong> Algoritmos y Estructuras de Datos III</p>
          <p><strong>Profesor:</strong> Sebastián Saldivar</p>
          <p><strong>Instituto:</strong> Instituto Tecnológico Beltrán</p>
          <p><strong>Año:</strong> 2025</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  mostrarEstadisticas(): void {
    const totalJugados = this.numerosSorteados.length;
    const numerosMarcados = this.contarNumerosMarcados();
    const lineasCompletas = this.contarLineasCompletas();
    
    // Determinar estado actual basado en eventos únicos
    let estadoJuego = 'En progreso';
    if (this.bingoYaCantado) {
      estadoJuego = '¡BINGO!';
    } else if (this.dobleLineaYaCantada) {
      estadoJuego = 'Doble Línea';
    } else if (this.lineaYaCantada) {
      estadoJuego = 'Una Línea';
    }
    
    Swal.fire({
      title: 'Estadísticas del Juego',
      html: `
        <div class="text-left">
          <p><strong>Números sorteados:</strong> ${totalJugados} / 90</p>
          <p><strong>Números marcados:</strong> ${numerosMarcados} / 15</p>
          <p><strong>Líneas completadas:</strong> ${lineasCompletas}</p>
          <p><strong>Progreso:</strong> ${Math.round((numerosMarcados / 15) * 100)}%</p>
          <hr style="margin: 15px 0;">
          <p><strong>Estado del juego:</strong> ${estadoJuego}</p>
          <hr style="margin: 15px 0;">
          <p><strong>Eventos cantados:</strong></p>
          <p>• Línea: ${this.lineaYaCantada ? 'Cantada' : 'Pendiente'}</p>
          <p>• Doble Línea: ${this.dobleLineaYaCantada ? 'Cantada' : 'Pendiente'}</p>
          <p>• Bingo: ${this.bingoYaCantado ? 'Cantado' : 'Pendiente'}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  mostrarAyuda(): void {
    Swal.fire({
      title: '¿Cómo Jugar Bingo?',
      html: `
        <div class="text-left">
          <h4><strong>Objetivo:</strong></h4>
          <p>Marca los números de tu cartón cuando sean cantados.</p>
          
          <h4><strong>Reglas:</strong></h4>
          <ul style="text-align: left; margin-left: 20px;">
            <li>Solo puedes marcar números que ya fueron sorteados</li>
            <li>Cada cartón tiene 15 números distribuidos en 3 filas</li>
            <li>Cada fila tiene 5 números y 4 espacios vacíos</li>
          </ul>
          
          <h4><strong>Formas de ganar:</strong></h4>
          <ul style="text-align: left; margin-left: 20px;">
            <li><strong>Línea:</strong> Completa una fila horizontal</li>
            <li><strong>Doble Línea:</strong> Completa dos filas horizontales</li>
            <li><strong>BINGO:</strong> Completa todo el cartón (15 números)</li>
          </ul>
        </div>
      `,
      icon: 'question',
      confirmButtonText: 'Entendido'
    });
  }

  cambiarTema(): void {
    Swal.fire({
      title: 'Cambiar Tema',
      text: 'Esta función estará disponible en una próxima versión.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Modo Oscuro (Próximamente)',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.snackBar.open('Función en desarrollo', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  // Método para marcar automáticamente números cuando salen
  marcarAutomaticamente(numero: number): void {
    if (!this.carton || this.carton.length === 0) return;
    
    for (let i = 0; i < this.carton.length; i++) {
      for (let j = 0; j < this.carton[i].length; j++) {
        const celda = this.carton[i][j];
        if (celda && celda.numero === numero && !celda.esLibre && !celda.marcada) {
          celda.marcada = true;
          console.log('[BINGO-GAME] Número marcado automáticamente:', numero);
          this.verificarCondicionesGanadoras();
          return; // Salir después de marcar el número
        }
      }
    }
  }

  // Método para enviar mensajes al chat
  enviarMensaje(mensaje: string): void {
    if (this.salaActual?.id && this.jugadorActual && mensaje.trim()) {
      this.socketService.enviarMensaje(this.salaActual.id, this.jugadorActual.id, mensaje.trim());
    }
  }
}

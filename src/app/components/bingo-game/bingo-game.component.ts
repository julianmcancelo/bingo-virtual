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
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { SocketService, Jugador, Sala, CeldaBingo } from '../../services/socket.service';
import { SettingsService } from '../../services/settings.service';
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
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    LobbyComponent,
    SalaComponent,
    JuegoComponent,
    LoginComponent
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
                {{ isConnected ? '✅' : '❌' }}
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
                      (iniciarJuegoEvent)="iniciarJuegoMultijugador()"
                      (volverAlLobbyEvent)="volverAlLobby()">
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
      <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
        <!-- Chat Button -->
        <button mat-fab color="accent" (click)="toggleChat()" matTooltip="Chat" class="chat-fab">
          <mat-icon>chat</mat-icon>
        </button>
        
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
          <button mat-menu-item (click)="mostrarInfoProyecto()">
            <mat-icon>info_outline</mat-icon>
            <span>Info del Proyecto</span>
          </button>
        </mat-menu>
      </div>

      <!-- Chat Modal -->
      <div *ngIf="chatAbierto" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" (click)="cerrarChat()">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md h-96 flex flex-col" (click)="$event.stopPropagation()">
          <!-- Chat Header -->
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-lg font-semibold">Chat de la Sala</h3>
            <button (click)="cerrarChat()" class="text-gray-500 hover:text-gray-700">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <!-- Chat Messages -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3" #chatMessages>
            <div *ngFor="let mensaje of mensajesChat" 
                 class="flex flex-col"
                 [ngClass]="{'items-end': mensaje.jugador === jugadorActual?.nombre, 'items-start': mensaje.jugador !== jugadorActual?.nombre}">
              <div class="max-w-xs px-3 py-2 rounded-lg"
                   [ngClass]="{
                     'bg-blue-500 text-white': mensaje.jugador === jugadorActual?.nombre,
                     'bg-gray-200 text-gray-800': mensaje.jugador !== jugadorActual?.nombre
                   }">
                <div class="text-xs opacity-75 mb-1">{{ mensaje.jugador }}</div>
                <div>{{ mensaje.mensaje }}</div>
                <div class="text-xs opacity-75 mt-1">{{ formatTime(mensaje.timestamp) }}</div>
              </div>
            </div>
            <div *ngIf="mensajesChat.length === 0" class="text-center text-gray-500 py-8">
              <mat-icon class="text-4xl mb-2">chat_bubble_outline</mat-icon>
              <p>¡Sé el primero en enviar un mensaje!</p>
            </div>
          </div>
          
          <!-- Chat Input -->
          <div class="border-t p-4">
            <div class="flex gap-2">
              <input 
                type="text" 
                [(ngModel)]="nuevoMensaje" 
                (keyup.enter)="enviarMensaje()"
                placeholder="Escribe un mensaje..."
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxlength="200">
              <button 
                (click)="enviarMensaje()" 
                [disabled]="!nuevoMensaje?.trim()"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
                <mat-icon>send</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
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
    private snackBar: MatSnackBar
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
  
  // Datos del juego
  carton: CeldaBingo[][] = [];
  numeroActual: number | null = null;
  numerosSorteados: number[] = [];
  hayBingo: boolean = false;
  
  // Chat modal
  chatAbierto: boolean = false;
  nuevoMensaje: string = '';
  
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
        if (data) {
          this.numeroActual = data.numero;
          this.numerosSorteados = data.numerosSorteados || [];
          console.log('[BINGO-GAME] Número actualizado:', this.numeroActual, 'Total sorteados:', this.numerosSorteados.length);
        }
      })
    );

    this.suscripciones.push(
      this.socketService.juegoIniciado$.subscribe((data: any) => {
        if (data) {
          console.log('[BINGO-GAME] Juego iniciado, generando cartón...');
          this.generarCarton();
          this.vistaActual = 'juego';
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

  // Generar cartón de bingo
  generarCarton(): void {
    this.carton = [];
    for (let i = 0; i < 3; i++) {
      const fila: CeldaBingo[] = [];
      for (let j = 0; j < 9; j++) {
        // Generar número aleatorio según la columna
        const min = j * 10 + 1;
        const max = (j + 1) * 10;
        const numero = Math.floor(Math.random() * (max - min + 1)) + min;
        
        // Celda libre en el centro
        if (i === 1 && j === 4) {
          fila.push({
            numero: null,
            marcada: true,
            esLibre: true
          });
        } else {
          fila.push({
            numero: numero,
            marcada: false,
            esLibre: false
          });
        }
      }
      this.carton.push(fila);
    }
    console.log('[BINGO-GAME] Cartón generado:', this.carton);
  }

  toggleCelda(event: { fila: number; columna: number }): void {
    if (!this.carton[event.fila] || !this.carton[event.fila][event.columna]) return;
    
    const celda = this.carton[event.fila][event.columna];
    if (celda && !celda.esLibre && celda.numero && this.numerosSorteados.includes(celda.numero)) {
      celda.marcada = !celda.marcada;
      console.log('[BINGO-GAME] Celda marcada:', celda.numero, 'Estado:', celda.marcada);
      this.verificarBingo();
    }
  }

  private verificarBingo(): boolean {
    // Verificar líneas horizontales
    for (let i = 0; i < this.carton.length; i++) {
      if (this.carton[i].every(celda => celda.marcada)) {
        console.log('[BINGO-GAME] ¡BINGO! Línea horizontal:', i);
        this.hayBingo = true;
        return true;
      }
    }
    
    // Verificar líneas verticales
    for (let j = 0; j < 9; j++) {
      if (this.carton.every(fila => fila[j].marcada)) {
        console.log('[BINGO-GAME] ¡BINGO! Línea vertical:', j);
        this.hayBingo = true;
        return true;
      }
    }
    
    return false;
  }

  // Métodos del chat
  toggleChat(): void {
    this.chatAbierto = !this.chatAbierto;
  }

  cerrarChat(): void {
    this.chatAbierto = false;
  }

  enviarMensaje(): void {
    if (this.nuevoMensaje.trim() && this.salaActual && this.jugadorActual) {
      this.socketService.enviarMensaje(this.salaActual.id, this.jugadorActual.nombre, this.nuevoMensaje.trim());
      this.nuevoMensaje = '';
    }
  }

  formatTime(timestamp: any): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

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
          <p><strong>Conexión Socket:</strong> ${conectado ? '✅ Conectado' : '❌ Desconectado'}</p>
          <p><strong>Socket Real:</strong> ${socketConnected ? '✅ Activo' : '❌ Inactivo'}</p>
          <p><strong>Socket Existe:</strong> ${socketExists ? '✅ Sí' : '❌ No'}</p>
          <p><strong>URL:</strong> <a href="${serverUrl}" target="_blank" style="color: #4f46e5;">${serverUrl}</a></p>
          <p><strong>Plataforma:</strong> Render.com</p>
          <p><strong>Estado:</strong> ${conectado && socketConnected ? '🟢 En línea' : '🔴 Fuera de línea'}</p>
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
          <div class="text-left">
            <p><strong>Números:</strong> 1 - 90</p>
            <p><strong>Modo:</strong> Multijugador en tiempo real</p>
            <p><strong>Tecnología:</strong> Socket.IO WebSockets</p>
            <hr style="margin: 15px 0;">
            <p><strong>Narrador:</strong> ${configuracion.narradorHabilitado ? 'Activado' : 'Desactivado'}</p>
            <p><strong>Marcado Automático:</strong> ${configuracion.marcadoAutomatico ? 'Activado' : 'Desactivado'}</p>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar'
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
}

/**
 * COMPONENTE DEL JUEGO DE BINGO
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Componente principal del juego de bingo
 */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { SocketService, Jugador, Sala, MensajeChat, CeldaBingo } from '../../services/socket.service';
import { SettingsService, GameSettings } from '../../services/settings.service';
import { LobbyComponent } from '../lobby/lobby.component';
import { SalaComponent } from '../sala/sala.component';
import { JuegoComponent } from '../juego/juego.component';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-bingo-game',
  standalone: true,
  imports: [
    CommonModule,
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

      <!-- Floating Action Button with Menu -->
      <div class="fixed bottom-6 right-6 z-50">
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
  socketService = inject(SocketService);
  settingsService = inject(SettingsService);
  router = inject(Router);

  // Estado del juego
  vistaActual: 'login' | 'lobby' | 'sala' | 'juego' = 'login';
  
  // Datos del jugador
  nombreJugadorInvitado: string = '';
  jugadorActual: Jugador | null = null;
  
  // Datos de la sala
  salaActual: Sala | null = null;
  jugadores: Jugador[] = [];
  
  // Datos del juego
  carton: CeldaBingo[][] = [];
  numeroActual: number | null = null;
  numerosSorteados: number[] = [];
  hayBingo: boolean = false;
  
  // Suscripciones
  private suscripciones: Subscription[] = [];

  ngOnInit(): void {
    this.inicializarSuscripciones();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(sub => sub.unsubscribe());
  }

  private inicializarSuscripciones(): void {
    // Suscripción a jugador actual
    this.suscripciones.push(
      this.socketService.jugadorActual$.subscribe(jugador => {
        console.log('Jugador actual:', jugador);
        this.jugadorActual = jugador;
      })
    );

    // Suscripción a sala actual
    this.suscripciones.push(
      this.socketService.salaActual$.subscribe((sala: Sala | null) => {
        console.log('Sala actual:', sala);
        this.salaActual = sala;
        if (sala) {
          this.jugadores = sala.jugadores;
        }
      })
    );

    // Suscripción a mensajes de chat
    this.suscripciones.push(
      this.socketService.mensajesChat$.subscribe(mensajes => {
        console.log('Mensajes de chat actualizados:', mensajes);
      })
    );
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

  toggleCelda(event: { fila: number; columna: number }): void {
    const celda = this.carton[event.fila][event.columna];
    if (celda && celda.numero === this.numeroActual) {
      celda.marcada = !celda.marcada;
      this.verificarBingo();
    }
  }

  private verificarBingo(): boolean {
    // Lógica de verificación de bingo
    return false;
  }

  // Métodos del menú
  mostrarEstadoServidor(): void {
    const conectado = this.socketService.conectado$.value;
    const serverUrl = 'http://localhost:3000';
    Swal.fire({
      title: 'Estado del Servidor',
      html: `
        <div class="text-left">
          <p><strong>Conexión:</strong> ${conectado ? '✅ Conectado' : '❌ Desconectado'}</p>
          <p><strong>URL:</strong> ${serverUrl}</p>
          <p><strong>Jugador:</strong> ${this.jugadorActual?.nombre || 'No identificado'}</p>
        </div>
      `,
      icon: conectado ? 'success' : 'error',
      confirmButtonText: 'Cerrar'
    });
  }

  mostrarAjustes(): void {
    this.settingsService.settings$.subscribe(settings => {
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

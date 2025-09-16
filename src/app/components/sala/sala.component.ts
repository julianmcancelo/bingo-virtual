import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Jugador, Sala, MensajeChat } from '../../services/socket.service';
import { SocketService } from '../../services/socket.service';
import { VersionService } from '../../services/version.service';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sala.component.html',
  styleUrls: ['./sala.component.css']
})
export class SalaComponent implements AfterViewChecked {
  // Propiedades de entrada para recibir datos del componente padre
  @Input() salaActual: Sala | null = null;
  @Input() jugadorActual: Jugador | null = null;
  @Input() jugadores: Jugador[] = [];
  @Input() mensajesChat: MensajeChat[] = [];

  // Eventos de salida para comunicarse con el componente padre
  @Output() iniciarJuegoEvent = new EventEmitter<void>();
  @Output() volverAlLobbyEvent = new EventEmitter<void>();
  @Output() enviarMensajeEvent = new EventEmitter<string>();

  // Referencias del DOM
  @ViewChild('chatMessages') chatMessages!: ElementRef;

  // Propiedades del chat
  nuevoMensaje: string = '';
  private shouldScrollToBottom = false;

  constructor(
    private socketService: SocketService,
    public versionService: VersionService
  ) {}

  // Determina si el jugador actual es el creador de la sala
  get esCreadorSala(): boolean {
    return this.salaActual?.jugadores[0]?.id === this.jugadorActual?.id;
  }

  // Emite el evento para iniciar el juego
  onIniciarJuego(): void {
    this.iniciarJuegoEvent.emit();
  }

  // Emite el evento para volver al lobby
  volverAlLobby(): void {
    this.volverAlLobbyEvent.emit();
  }

  showChangelog(): void {
    this.versionService.showChangelogModal();
  }

  // Lifecycle hook para scroll automático del chat
  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  // Copia el ID de la sala al portapapeles
  copiarIdSala(): void {
    if (this.salaActual?.id) {
      navigator.clipboard.writeText(this.salaActual.id).then(() => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'ID de sala copiado',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      }).catch(err => {
        console.error('Error al copiar el ID: ', err);
        alert('No se pudo copiar el ID.');
      });
    }
  }

  // Envía un mensaje al chat
  enviarMensaje(): void {
    if (this.nuevoMensaje.trim() && this.salaActual?.id && this.jugadorActual) {
      const mensaje: MensajeChat = {
        id: Date.now().toString(),
        jugador: this.jugadorActual.nombre,
        mensaje: this.nuevoMensaje.trim(),
        timestamp: new Date()
      };
      
      this.socketService.enviarMensaje(this.salaActual.id, this.jugadorActual.id, mensaje.mensaje);
      this.nuevoMensaje = '';
      this.shouldScrollToBottom = true;
    }
  }

  // Formatea la hora del mensaje
  formatTime(timestamp: Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Hace scroll al final del chat
  private scrollToBottom(): void {
    try {
      if (this.chatMessages) {
        this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }
}

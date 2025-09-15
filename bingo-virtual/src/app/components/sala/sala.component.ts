import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Jugador, Sala, MensajeChat } from '../../services/socket.service';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sala.component.html',
  styleUrls: ['./sala.component.css']
})
export class SalaComponent {
  @Input() salaActual: Sala | null = null;
  @Input() jugadorActual: Jugador | null = null;
  @Input() jugadores: Jugador[] = [];
  @Input() mensajesChat: MensajeChat[] = [];

  @Output() iniciarJuegoEvent = new EventEmitter<void>();
  @Output() enviarMensajeEvent = new EventEmitter<string>();
  @Output() volverAlLobbyEvent = new EventEmitter<void>();

  nuevoMensaje = '';

  get puedeIniciarJuego(): boolean {
    return this.salaActual?.jugadores[0]?.id === this.jugadorActual?.id && this.jugadores.length >= 1;
  }

  onIniciarJuego(): void {
    this.iniciarJuegoEvent.emit();
  }

  onEnviarMensaje(): void {
    if (this.nuevoMensaje.trim()) {
      this.enviarMensajeEvent.emit(this.nuevoMensaje);
      this.nuevoMensaje = '';
    }
  }

  onEnterChat(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onEnviarMensaje();
    }
  }

  onVolverAlLobby(): void {
    this.volverAlLobbyEvent.emit();
  }

  formatearTiempo(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleTimeString();
  }
}

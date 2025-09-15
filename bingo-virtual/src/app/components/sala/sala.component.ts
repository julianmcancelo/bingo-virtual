import { Component, Input, Output, EventEmitter } from '@angular/core';
import Swal from 'sweetalert2';
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
  // Propiedades de entrada para recibir datos del componente padre
  @Input() salaActual: Sala | null = null;
  @Input() jugadorActual: Jugador | null = null;
  @Input() jugadores: Jugador[] = [];

  // Eventos de salida para comunicarse con el componente padre
  @Output() iniciarJuegoEvent = new EventEmitter<void>();
  @Output() volverAlLobbyEvent = new EventEmitter<void>();

  // Determina si el jugador actual es el creador de la sala
  get esCreadorSala(): boolean {
    return this.salaActual?.jugadores[0]?.id === this.jugadorActual?.id;
  }

  // Emite el evento para iniciar el juego
  onIniciarJuego(): void {
    this.iniciarJuegoEvent.emit();
  }

  // Emite el evento para volver al lobby
  onVolverAlLobby(): void {
    this.volverAlLobbyEvent.emit();
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
}

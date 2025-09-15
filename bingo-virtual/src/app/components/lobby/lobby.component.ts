import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent {
  @Output() crearSalaEvent = new EventEmitter<{ nombreSala: string, nombreJugador: string }>();

  nombreJugador = '';
  nombreSala = '';

  onCrearSala(): void {
    if (!this.nombreSala.trim() || !this.nombreJugador.trim()) {
      alert('Por favor, completa todos los campos para crear la sala.');
      return;
    }
    this.crearSalaEvent.emit({ nombreSala: this.nombreSala, nombreJugador: this.nombreJugador });
  }
}

import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { VersionService } from '../../services/version.service';
import { ChatFlotanteComponent } from '../shared/chat-flotante/chat-flotante.component';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatTabsModule, MatIconModule, ChatFlotanteComponent],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  @Output() crearSalaEvent = new EventEmitter<{ nombreSala: string, nombreJugador: string }>();
  @Input() nombreJugador: string = '';
  @Output() unirseASalaEvent = new EventEmitter<{ salaId: string, nombreJugador: string }>();

  tab: 'crear' | 'unirse' = 'crear';

  nombreSala = '';
  salaIdUnirse = '';

  constructor(public versionService: VersionService) {}

  ngOnInit(): void {
    // Al iniciar, el nombre del jugador se pre-carga si viene del login de invitado
    // No se necesita una variable local adicional, podemos usar 'nombreJugador' directamente.
  }

  onCrearSala(): void {
    if (!this.nombreSala.trim() || !this.nombreJugador.trim()) {
      Swal.fire('Campos incompletos', 'Por favor, completa tu nombre y el nombre de la sala.', 'warning');
      return;
    }
    this.crearSalaEvent.emit({ nombreSala: this.nombreSala, nombreJugador: this.nombreJugador });
  }

  unirseASala(): void {
    if (!this.salaIdUnirse.trim() || !this.nombreJugador.trim()) {
      Swal.fire('Campos incompletos', 'Por favor, completa tu nombre y el ID de la sala.', 'warning');
      return;
    }
    this.unirseASalaEvent.emit({ salaId: this.salaIdUnirse, nombreJugador: this.nombreJugador });
  }

  showChangelog(): void {
    this.versionService.showChangelogModal();
  }
}

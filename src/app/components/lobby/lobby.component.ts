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
import { AuthService } from '../../services/auth.service';

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
  // Estado de autenticación para personalizar la UI del Lobby
  isAuthenticated = false;
  currentUserName = '';
  currentUserId: number | null = null;

  // --- Métricas del jugador (futuro: persistir en servidor) ---
  // Por ahora se leen/guardan localmente para mostrar en la UI.
  victorias = 0;
  derrotas = 0;
  lineasCompletas = 0;

  constructor(public versionService: VersionService, private authService: AuthService) {}

  ngOnInit(): void {
    // Al iniciar, detectamos si hay usuario autenticado para personalizar la experiencia.
    // Si hay sesión, pre-cargamos el nombre del usuario y deshabilitamos la edición del campo.
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUserName = user?.nombre_usuario || user?.email || '';
      this.currentUserId = (user as any)?.id ?? null;
      if (this.isAuthenticated) {
        this.nombreJugador = this.currentUserName;
        // Cargar métricas del usuario si están guardadas en localStorage
        this.cargarMetricasUsuario();
      }
    });
  }

  /**
   * Carga métricas del usuario desde localStorage si existen.
   * Clave: stats_<userId> -> { victorias, derrotas, lineasCompletas }
   */
  private cargarMetricasUsuario(): void {
    try {
      if (!this.currentUserId) return;
      const raw = localStorage.getItem(`stats_${this.currentUserId}`);
      if (!raw) return;
      const stats = JSON.parse(raw);
      this.victorias = Number(stats?.victorias || 0);
      this.derrotas = Number(stats?.derrotas || 0);
      this.lineasCompletas = Number(stats?.lineasCompletas || 0);
    } catch {
      // Ignorar errores de parseo
    }
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

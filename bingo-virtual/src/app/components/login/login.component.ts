import { Component, Output, EventEmitter } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  @Output() loginComoInvitado = new EventEmitter<string>();
  nombreJugador: string = '';

  iniciarComoInvitado(): void {
    if (this.nombreJugador.trim()) {
      this.loginComoInvitado.emit(this.nombreJugador);
    }
  }

  proximamente(): void {
    Swal.fire({
      title: 'Próximamente',
      text: 'Esta función estará disponible en futuras actualizaciones.',
      icon: 'info',
      confirmButtonColor: 'var(--itb-accent-blue)',
      confirmButtonText: 'Entendido'
    });
  }
}

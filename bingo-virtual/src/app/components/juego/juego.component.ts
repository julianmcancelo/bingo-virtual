import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartonBingoComponent } from '../carton-bingo/carton-bingo.component';
import { Jugador, CeldaBingo } from '../../services/socket.service';

@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [CommonModule, CartonBingoComponent],
  templateUrl: './juego.component.html',
  styleUrls: ['./juego.component.css']
})
export class JuegoComponent {
  @Input() jugadorActual: Jugador | null = null;
  @Input() carton: CeldaBingo[][] = [];
  @Input() numeroActual: number | null = null;
  @Input() numerosSorteados: number[] = [];

  @Output() toggleCeldaEvent = new EventEmitter<{ fila: number, columna: number }>();

  onToggleCelda(event: { fila: number, columna: number }): void {
    this.toggleCeldaEvent.emit(event);
  }

  numeroDisponible(numero: number): boolean {
    return this.numerosSorteados.includes(numero);
  }
}

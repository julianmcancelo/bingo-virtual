import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carton-bingo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carton-bingo.component.html',
  styleUrls: ['./carton-bingo.component.css']
})
export class CartonBingoComponent {
  @Input() carton: (any | null)[][] = [];
  @Input() numerosSorteados: number[] = [];
  @Output() toggleCeldaEvent = new EventEmitter<{ fila: number, columna: number }>();

  onToggleCelda(fila: number, columna: number): void {
    if (this.carton && this.carton[fila] && this.carton[fila][columna]) {
      this.toggleCeldaEvent.emit({ fila, columna });
    }
  }

  estaMarcada(celda: any): boolean {
    return celda && celda.marcada && !celda.esLibre;
  }
}

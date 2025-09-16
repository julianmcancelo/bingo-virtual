import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carton-bingo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carton-bingo.component.html',
  styleUrls: ['./carton-bingo.component.css']
})
export class CartonBingoComponent implements OnChanges {
  @Input() carton: (any | null)[][] = [];
  @Input() numerosSorteados: number[] = [];
  @Output() toggleCeldaEvent = new EventEmitter<{ fila: number, columna: number }>();

  logoCell: { fila: number, columna: number } | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['carton'] && this.carton && this.carton.length > 0) {
      this.findLogoCell();
    }
  }

  private findLogoCell(): void {
    const middleRow = Math.floor(this.carton.length / 2);
    if (this.carton[middleRow]) {
      for (let j = 0; j < this.carton[middleRow].length; j++) {
        if (this.carton[middleRow][j]?.numero === null) {
          this.logoCell = { fila: middleRow, columna: j };
          return;
        }
      }
    }
    // Fallback if middle row is full
    for (let i = 0; i < this.carton.length; i++) {
      for (let j = 0; j < this.carton[i].length; j++) {
        if (this.carton[i][j]?.numero === null) {
          this.logoCell = { fila: i, columna: j };
          return;
        }
      }
    }
  }

  onToggleCelda(fila: number, columna: number): void {
    if (this.isLogoCell(fila, columna)) return; // Prevent clicking on logo
    if (this.carton && this.carton[fila] && this.carton[fila][columna]) {
      this.toggleCeldaEvent.emit({ fila, columna });
    }
  }

  estaMarcada(celda: any): boolean {
    return celda && celda.marcada && !celda.esLibre;
  }

  isLogoCell(fila: number, columna: number): boolean {
    return this.logoCell !== null && this.logoCell.fila === fila && this.logoCell.columna === columna;
  }
}

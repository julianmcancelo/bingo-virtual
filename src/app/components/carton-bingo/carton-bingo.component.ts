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
    // Ya no necesitamos buscar celda para logo, se muestra en esquina
    this.logoCell = null;
  }

  onToggleCelda(fila: number, columna: number): void {
    if (this.carton && this.carton[fila] && this.carton[fila][columna]) {
      const celda = this.carton[fila][columna];
      if (!celda.esLibre) {
        this.toggleCeldaEvent.emit({ fila, columna });
      }
    }
  }

  estaMarcada(celda: any): boolean {
    return celda && celda.marcada && !celda.esLibre;
  }

  isLogoCell(fila: number, columna: number): boolean {
    return false; // Ya no usamos celdas para el logo
  }
}

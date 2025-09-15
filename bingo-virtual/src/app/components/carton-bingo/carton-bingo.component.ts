import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carton-bingo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carton-bingo.component.html',
  styleUrls: ['./carton-bingo.component.css']
})
export class CartonBingoComponent implements OnInit {
  carton: (number | null)[][] = [];

  ngOnInit(): void {
    this.generarCarton();
  }

  /**
   * Genera un cartón de bingo argentino de 3x9 con 15 números.
   */
  generarCarton(): void {
    // 1. Inicializar una matriz de 3x9 con null
    let carton = Array(3).fill(0).map(() => Array(9).fill(null));

    // 2. Generar números para cada columna y colocarlos
    for (let col = 0; col < 9; col++) {
      const min = col * 10 + (col === 0 ? 1 : 0);
      const max = col * 10 + 9 + (col === 8 ? 1 : 0);
      const rango = Array.from({ length: max - min + 1 }, (_, i) => min + i);

      // Barajar los números del rango
      for (let i = rango.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rango[i], rango[j]] = [rango[j], rango[i]];
      }

      // Decidir cuántos números poner en esta columna (1 o 2)
      const numerosEnColumna = col < 6 ? 2 : 1; // Simple distribución: 6x2 + 3x1 = 15
      const numerosSeleccionados = rango.slice(0, numerosEnColumna);

      // Asignar números a filas aleatorias
      let filasAsignadas: number[] = [];
      while (filasAsignadas.length < numerosEnColumna) {
        const filaAleatoria = Math.floor(Math.random() * 3);
        if (!filasAsignadas.includes(filaAleatoria)) {
          filasAsignadas.push(filaAleatoria);
        }
      }

      filasAsignadas.forEach((fila, index) => {
        carton[fila][col] = numerosSeleccionados[index];
      });
    }

    // 3. Asegurar que cada fila tenga 5 números
    for (let fila = 0; fila < 3; fila++) {
      let numerosEnFila = carton[fila].filter(n => n !== null).length;
      while (numerosEnFila < 5) {
        let colAleatoria: number;
        do {
          colAleatoria = Math.floor(Math.random() * 9);
        } while (carton[fila][colAleatoria] !== null || carton.filter(f => f[colAleatoria] !== null).length >= 2);

        const min = colAleatoria * 10 + (colAleatoria === 0 ? 1 : 0);
        const max = colAleatoria * 10 + 9 + (colAleatoria === 8 ? 1 : 0);
        let nuevoNumero;
        do {
          nuevoNumero = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (this.numeroYaEnCarton(carton, nuevoNumero));
        
        carton[fila][colAleatoria] = nuevoNumero;
        numerosEnFila++;
      }
    }

    // 4. Ordenar números dentro de cada columna
    for (let col = 0; col < 9; col++) {
      const numerosColumna = carton.map(fila => fila[col]).filter(n => n !== null);
      numerosColumna.sort((a, b) => a! - b!);
      let indexNumero = 0;
      for (let fila = 0; fila < 3; fila++) {
        if (carton[fila][col] !== null) {
          carton[fila][col] = numerosColumna[indexNumero++];
        }
      }
    }

    this.carton = carton;
  }

  private numeroYaEnCarton(carton: (number|null)[][], numero: number): boolean {
    return carton.some(fila => fila.includes(numero));
  }
}

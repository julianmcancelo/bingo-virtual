/**
 * PIPE NUMBERFORMAT - Formatea números con separadores
 *
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Pipe que formatea números con separadores de miles
 *
 * @complejidad O(n) - Lineal respecto a la longitud del número
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat',
  standalone: true
})
export class NumberFormatPipe implements PipeTransform {

  transform(value: number | string): string {
    if (!value && value !== 0) return '';

    const num = typeof value === 'string' ? parseInt(value, 10) : value;

    if (isNaN(num)) return '';

    return num.toLocaleString('es-AR'); // Formato argentino
  }
}

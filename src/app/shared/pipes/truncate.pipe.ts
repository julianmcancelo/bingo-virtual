/**
 * PIPE TRUNCATE - Limita texto a longitud específica
 *
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Pipe que trunca texto y agrega "..." si es muy largo
 *
 * @complejidad O(n) - Lineal respecto a la longitud del texto
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, limit: number = 20, suffix: string = '...'): string {
    if (!value || value.length <= limit) {
      return value;
    }
    return value.substring(0, limit) + suffix;
  }
}

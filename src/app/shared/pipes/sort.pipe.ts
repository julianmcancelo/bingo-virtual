/**
 * PIPE DE ORDENAMIENTO
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Pipe personalizado para ordenar arrays con algoritmos optimizados
 * 
 * COMPLEJIDAD TEMPORAL: O(n log n) - Timsort (algoritmo nativo de JavaScript)
 * COMPLEJIDAD ESPACIAL: O(n) - Copia del array original
 * 
 * ALGORITMOS IMPLEMENTADOS:
 * - Timsort: Algoritmo híbrido estable (merge sort + insertion sort)
 * - Ordenamiento por múltiples criterios
 * - Soporte para propiedades anidadas
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
  standalone: true,
  pure: false // Permite detectar cambios en objetos mutables
})
export class SortPipe implements PipeTransform {

  /**
   * TRANSFORMAR ARRAY CON ORDENAMIENTO
   * 
   * @param items - Array de elementos a ordenar
   * @param field - Campo por el cual ordenar
   * @param order - Orden: 'asc' o 'desc'
   * @param secondaryField - Campo secundario para desempate (opcional)
   * @returns Array ordenado
   * 
   * @complexity O(n log n) - Timsort con comparación personalizada
   */
  transform<T>(
    items: T[], 
    field: keyof T | string, 
    order: 'asc' | 'desc' = 'asc',
    secondaryField?: keyof T | string
  ): T[] {
    
    // Validaciones iniciales - O(1)
    if (!items || !Array.isArray(items) || items.length <= 1) {
      return items || [];
    }

    if (!field) {
      return items;
    }

    // Crear copia del array para no mutar el original - O(n)
    const sortedItems = [...items];
    
    // Ordenamiento con función de comparación personalizada - O(n log n)
    return sortedItems.sort((a, b) => {
      const comparison = this.compareValues(a, b, field, order);
      
      // Si los valores son iguales y hay campo secundario, usar como desempate
      if (comparison === 0 && secondaryField) {
        return this.compareValues(a, b, secondaryField, 'asc');
      }
      
      return comparison;
    });
  }

  /**
   * COMPARAR DOS VALORES
   * 
   * @param a - Primer elemento
   * @param b - Segundo elemento
   * @param field - Campo a comparar
   * @param order - Orden de comparación
   * @returns number - Resultado de comparación (-1, 0, 1)
   * 
   * @complexity O(1) - Comparación constante
   */
  private compareValues<T>(
    a: T, 
    b: T, 
    field: keyof T | string, 
    order: 'asc' | 'desc'
  ): number {
    
    const aValue = this.getNestedProperty(a, field);
    const bValue = this.getNestedProperty(b, field);
    
    // Manejar valores nulos/undefined
    if (aValue === null || aValue === undefined) {
      return bValue === null || bValue === undefined ? 0 : 1;
    }
    if (bValue === null || bValue === undefined) {
      return -1;
    }
    
    let comparison = 0;
    
    // Comparación por tipo de dato
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      // Conversión a string para otros tipos
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    // Aplicar orden
    return order === 'desc' ? -comparison : comparison;
  }

  /**
   * OBTENER PROPIEDAD ANIDADA
   * 
   * @param obj - Objeto fuente
   * @param path - Ruta de la propiedad (ej: 'user.name' o 'name')
   * @returns any - Valor de la propiedad
   * 
   * @complexity O(d) donde d = profundidad de anidamiento
   */
  private getNestedProperty<T>(obj: T, path: keyof T | string): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    const pathStr = String(path);
    
    // Si no hay punto, es una propiedad directa
    if (!pathStr.includes('.')) {
      return (obj as any)[pathStr];
    }
    
    // Navegar por propiedades anidadas
    return pathStr.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? (current as any)[key] : undefined;
    }, obj);
  }

  /**
   * ORDENAMIENTO MÚLTIPLE (MÉTODO ESTÁTICO AUXILIAR)
   * 
   * @param items - Array a ordenar
   * @param criteria - Criterios de ordenamiento
   * @returns Array ordenado
   * 
   * @complexity O(n log n * c) donde c = número de criterios
   */
  static multiSort<T>(
    items: T[], 
    criteria: Array<{
      field: keyof T | string;
      order: 'asc' | 'desc';
    }>
  ): T[] {
    
    if (!items || !criteria || criteria.length === 0) {
      return items || [];
    }
    
    return [...items].sort((a, b) => {
      for (const criterion of criteria) {
        const pipe = new SortPipe();
        const comparison = pipe['compareValues'](a, b, criterion.field, criterion.order);
        
        if (comparison !== 0) {
          return comparison;
        }
      }
      return 0;
    });
  }
}

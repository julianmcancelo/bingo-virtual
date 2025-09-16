/**
 * PIPE DE FILTRADO Y BÚSQUEDA
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Pipe personalizado para filtrar arrays con algoritmos de búsqueda
 * 
 * COMPLEJIDAD TEMPORAL: O(n*m) donde n = elementos del array, m = propiedades a buscar
 * COMPLEJIDAD ESPACIAL: O(k) donde k = elementos que coinciden con el filtro
 * 
 * ALGORITMOS IMPLEMENTADOS:
 * - Búsqueda lineal con coincidencia parcial
 * - Normalización de texto (toLowerCase, trim)
 * - Búsqueda en múltiples propiedades
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter',
  standalone: true,
  pure: false // Permite detectar cambios en objetos mutables
})
export class SearchFilterPipe implements PipeTransform {

  /**
   * TRANSFORMAR ARRAY CON FILTRO DE BÚSQUEDA
   * 
   * @param items - Array de elementos a filtrar
   * @param searchText - Texto de búsqueda
   * @param searchFields - Campos en los que buscar (opcional)
   * @returns Array filtrado
   * 
   * @complexity O(n*m) - n elementos, m campos de búsqueda
   */
  transform<T>(
    items: T[], 
    searchText: string, 
    searchFields?: (keyof T)[]
  ): T[] {
    
    // Validaciones iniciales - O(1)
    if (!items || !Array.isArray(items)) {
      return [];
    }

    if (!searchText || searchText.trim() === '') {
      return items;
    }

    // Normalizar texto de búsqueda - O(1)
    const normalizedSearchText = this.normalizeText(searchText);
    
    // Filtrar elementos - O(n*m)
    return items.filter(item => 
      this.matchesSearchCriteria(item, normalizedSearchText, searchFields)
    );
  }

  /**
   * VERIFICAR SI UN ELEMENTO COINCIDE CON LOS CRITERIOS DE BÚSQUEDA
   * 
   * @param item - Elemento a evaluar
   * @param searchText - Texto normalizado de búsqueda
   * @param searchFields - Campos específicos donde buscar
   * @returns boolean - true si coincide
   * 
   * @complexity O(m) donde m = número de campos a evaluar
   */
  private matchesSearchCriteria<T>(
    item: T, 
    searchText: string, 
    searchFields?: (keyof T)[]
  ): boolean {
    
    // Si se especifican campos, buscar solo en esos campos
    if (searchFields && searchFields.length > 0) {
      return searchFields.some(field => {
        const fieldValue = item[field];
        return this.matchesText(fieldValue, searchText);
      });
    }

    // Si no se especifican campos, buscar en todas las propiedades string
    return Object.values(item as any).some(value => 
      this.matchesText(value, searchText)
    );
  }

  /**
   * VERIFICAR COINCIDENCIA DE TEXTO
   * 
   * @param value - Valor a evaluar
   * @param searchText - Texto de búsqueda normalizado
   * @returns boolean - true si hay coincidencia
   * 
   * @complexity O(1) - Operación de búsqueda de substring
   */
  private matchesText(value: any, searchText: string): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    const normalizedValue = this.normalizeText(String(value));
    return normalizedValue.includes(searchText);
  }

  /**
   * NORMALIZAR TEXTO PARA BÚSQUEDA
   * 
   * @param text - Texto a normalizar
   * @returns string - Texto normalizado
   * 
   * @complexity O(n) donde n = longitud del texto
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD') // Descomponer caracteres acentuados
      .replace(/[\u0300-\u036f]/g, ''); // Remover diacríticos
  }
}

/**
 * SERVICIO HTTP CENTRALIZADO
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Servicio HTTP centralizado con interceptores y manejo de errores
 * 
 * COMPLEJIDAD TEMPORAL: O(1) para operaciones básicas, O(n) para transformaciones
 * COMPLEJIDAD ESPACIAL: O(1) para almacenamiento de configuración
 * 
 * PATRONES IMPLEMENTADOS:
 * - Facade Pattern: Interfaz simplificada para HttpClient
 * - Interceptor Pattern: Manejo centralizado de requests/responses
 * - Observer Pattern: Uso de RxJS para operaciones asíncronas
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, timeout, map, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface HttpOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  timeout?: number;
  retries?: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  
  private readonly baseUrl = environment.apiUrl || 'http://localhost:3000/api';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  /**
   * OBSERVABLE PARA ESTADO DE CARGA
   */
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * PETICIÓN GET GENÉRICA
   * 
   * @param endpoint - Endpoint de la API
   * @param options - Opciones HTTP adicionales
   * @returns Observable<T> - Respuesta tipada
   * 
   * @complexity O(1) - Operación de red constante
   */
  get<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    return this.makeRequest<T>('GET', endpoint, null, options);
  }

  /**
   * PETICIÓN POST GENÉRICA
   * 
   * @param endpoint - Endpoint de la API
   * @param data - Datos a enviar
   * @param options - Opciones HTTP adicionales
   * @returns Observable<T> - Respuesta tipada
   * 
   * @complexity O(1) - Operación de red constante
   */
  post<T>(endpoint: string, data: any, options?: HttpOptions): Observable<T> {
    return this.makeRequest<T>('POST', endpoint, data, options);
  }

  /**
   * PETICIÓN PUT GENÉRICA
   * 
   * @param endpoint - Endpoint de la API
   * @param data - Datos a actualizar
   * @param options - Opciones HTTP adicionales
   * @returns Observable<T> - Respuesta tipada
   * 
   * @complexity O(1) - Operación de red constante
   */
  put<T>(endpoint: string, data: any, options?: HttpOptions): Observable<T> {
    return this.makeRequest<T>('PUT', endpoint, data, options);
  }

  /**
   * PETICIÓN DELETE GENÉRICA
   * 
   * @param endpoint - Endpoint de la API
   * @param options - Opciones HTTP adicionales
   * @returns Observable<T> - Respuesta tipada
   * 
   * @complexity O(1) - Operación de red constante
   */
  delete<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    return this.makeRequest<T>('DELETE', endpoint, null, options);
  }

  /**
   * PETICIÓN PATCH GENÉRICA
   * 
   * @param endpoint - Endpoint de la API
   * @param data - Datos parciales a actualizar
   * @param options - Opciones HTTP adicionales
   * @returns Observable<T> - Respuesta tipada
   * 
   * @complexity O(1) - Operación de red constante
   */
  patch<T>(endpoint: string, data: any, options?: HttpOptions): Observable<T> {
    return this.makeRequest<T>('PATCH', endpoint, data, options);
  }

  /**
   * SUBIR ARCHIVO
   * 
   * @param endpoint - Endpoint para subida
   * @param file - Archivo a subir
   * @param additionalData - Datos adicionales
   * @returns Observable<T> - Respuesta del servidor
   * 
   * @complexity O(1) - Operación de subida constante
   */
  uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.makeRequest<T>('POST', endpoint, formData, {
      // No establecer Content-Type para FormData (se establece automáticamente)
      headers: {}
    });
  }

  /**
   * MÉTODO PRIVADO PARA REALIZAR PETICIONES
   * 
   * @param method - Método HTTP
   * @param endpoint - Endpoint de la API
   * @param data - Datos a enviar
   * @param options - Opciones HTTP
   * @returns Observable<T> - Respuesta procesada
   */
  private makeRequest<T>(
    method: string, 
    endpoint: string, 
    data: any, 
    options?: HttpOptions
  ): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const httpOptions = this.buildHttpOptions(options);
    
    this.setLoading(true);

    let request: Observable<any>;

    switch (method.toUpperCase()) {
      case 'GET':
        request = this.http.get(url, httpOptions);
        break;
      case 'POST':
        request = this.http.post(url, data, httpOptions);
        break;
      case 'PUT':
        request = this.http.put(url, data, httpOptions);
        break;
      case 'DELETE':
        request = this.http.delete(url, httpOptions);
        break;
      case 'PATCH':
        request = this.http.patch(url, data, httpOptions);
        break;
      default:
        return throwError(() => new Error(`Método HTTP no soportado: ${method}`));
    }

    return request.pipe(
      timeout(options?.timeout || 30000), // 30 segundos por defecto
      retry(options?.retries || 0), // Sin reintentos por defecto
      map((response: any) => this.processResponse<T>(response)),
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * CONSTRUIR OPCIONES HTTP
   * 
   * @param options - Opciones proporcionadas
   * @returns object - Opciones HTTP formateadas
   */
  private buildHttpOptions(options?: HttpOptions): any {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    return {
      headers: options?.headers ? 
        { ...defaultHeaders, ...options.headers } : 
        defaultHeaders,
      params: options?.params || {}
    };
  }

  /**
   * PROCESAR RESPUESTA DEL SERVIDOR
   * 
   * @param response - Respuesta cruda del servidor
   * @returns T - Respuesta procesada
   * 
   * @complexity O(1) - Procesamiento constante
   */
  private processResponse<T>(response: any): T {
    // Si la respuesta ya tiene el formato esperado, devolverla directamente
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data;
    }
    
    // Si no, devolver la respuesta completa
    return response;
  }

  /**
   * MANEJAR ERRORES HTTP
   * 
   * @param error - Error HTTP
   * @returns Observable<never> - Observable de error
   * 
   * @complexity O(1) - Manejo constante de errores
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud incorrecta';
          break;
        case 401:
          errorMessage = 'No autorizado';
          break;
        case 403:
          errorMessage = 'Acceso prohibido';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        case 503:
          errorMessage = 'Servicio no disponible';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      }
    }

    console.error('Error HTTP:', {
      status: error.status,
      message: errorMessage,
      url: error.url,
      error: error.error
    });

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      originalError: error
    }));
  }

  /**
   * ESTABLECER ESTADO DE CARGA
   * 
   * @param loading - Estado de carga
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * OBTENER ESTADO DE CARGA ACTUAL
   * 
   * @returns boolean - Estado actual de carga
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}

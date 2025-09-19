import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Usuario } from 'src/app/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = `${environment.apiUrl}/perfil`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el perfil del usuario autenticado
   */
  obtenerMiPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/mi-perfil`);
  }

  /**
   * Obtiene el perfil público de un usuario
   * @param usuarioId ID del usuario
   */
  obtenerPerfilPublico(usuarioId: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${usuarioId}`);
  }

  /**
   * Actualiza la información del perfil del usuario
   * @param datos Datos del perfil a actualizar
   */
  actualizarPerfil(datos: any): Observable<Usuario> {
    // Filtrar solo los campos que no son nulos o indefinidos
    const datosActualizados = Object.fromEntries(
      Object.entries(datos).filter(([_, value]) => value !== null && value !== undefined)
    );

    return this.http.put<Usuario>(`${this.apiUrl}/actualizar`, datosActualizados);
  }

  /**
   * Actualiza el avatar del usuario
   * @param fileName Nombre del archivo de avatar
   */
  actualizarAvatar(fileName: string): Observable<{ avatar_url: string }> {
    // Asegurarse de que solo se envíe el nombre del archivo, no la ruta completa
    const avatarName = fileName.split('/').pop() || fileName;
    
    console.log('=== Iniciando actualizarAvatar ===');
    console.log('Archivo de avatar seleccionado:', avatarName);
    
    // Enviar como JSON para selección de avatar existente
    const requestBody = { avatar: avatarName };
    console.log('Cuerpo de la solicitud:', JSON.stringify(requestBody));
    
    return this.http.post<{ 
      success: boolean; 
      message: string; 
      data: { avatar_url: string } 
    }>(
      `${this.apiUrl}/avatar`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      }
    ).pipe(
      tap(response => {
        console.log('=== Respuesta del servidor ===');
        console.log('Código de estado: 200');
        console.log('Respuesta:', response);
      }),
      map(response => {
        if (response && response.success && response.data && response.data.avatar_url) {
          console.log('Avatar actualizado exitosamente:', response.data.avatar_url);
          return { avatar_url: response.data.avatar_url };
        }
        const errorMessage = response?.message || 'Error al actualizar el avatar';
        console.error('Error en la respuesta del servidor:', errorMessage);
        throw new Error(errorMessage);
      }),
      catchError(error => {
        console.error('=== Error en la petición ===');
        console.error('Error completo:', error);
        if (error.error) {
          console.error('Error del servidor:', error.error);
        }
        if (error.status) {
          console.error('Código de estado HTTP:', error.status);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina el avatar del usuario
   */
  eliminarAvatar(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/avatar`);
  }

  /**
   * Verifica si el usuario puede cambiar su apodo
   */
  puedeCambiarApodo(): Observable<{
    puede_cambiar_apodo: boolean;
    dias_restantes: number;
    proximo_cambio_disponible: string;
  }> {
    return this.http.get<{
      puede_cambiar_apodo: boolean;
      dias_restantes: number;
      proximo_cambio_disponible: string;
    }>(`${this.apiUrl}/verificar-cambio-apodo`);
  }
}

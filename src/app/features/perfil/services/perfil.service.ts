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
    
    console.log('Enviando solicitud para actualizar avatar:', avatarName);
    
    // Crear un objeto FormData para enviar el archivo
    const formData = new FormData();
    formData.append('avatar', avatarName);
    
    // Enviar como FormData
    return this.http.post<{ 
      success: boolean; 
      message: string; 
      data: { avatar_url: string } 
    }>(
      `${this.apiUrl}/avatar`, 
      formData
    ).pipe(
      map(response => {
        console.log('Respuesta del servidor al actualizar avatar:', response);
        if (response && response.success && response.data && response.data.avatar_url) {
          return { avatar_url: response.data.avatar_url };
        }
        throw new Error(response?.message || 'Error al actualizar el avatar');
      }),
      catchError(error => {
        console.error('Error en la petición de actualización de avatar:', error);
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

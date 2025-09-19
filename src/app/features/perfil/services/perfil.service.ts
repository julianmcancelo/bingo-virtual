import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Usuario } from 'src/app/models/usuario.model';

interface AvatarResponse {
  success: boolean;
  message?: string;
  data?: {
    avatar_url: string;
  };
}

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
    return this.http.get<{success: boolean, data: Usuario}>(`${this.apiUrl}/mi-perfil`).pipe(
      map(response => response.data)
    );
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
   * @param file Nombre del archivo de avatar o File para subir
   */
  actualizarAvatar(file: File | string): Observable<{ 
    avatar_url: string;
    frontend_avatar_url?: string;
    is_predefined?: boolean;
  }> {
    // Si es un string, es el nombre de un avatar predefinido o personalizado
    if (typeof file === 'string') {
      // Aseguramos que solo tomemos el nombre del archivo sin rutas
      const avatarName = file.split('/').pop() || file;
      
      // Verificamos si es un avatar predefinido
      const predefinedAvatars = ['16.png', 'lightning.png', 'noctis.png', 'rinoa.png', 'squall.png'];
      const isPredefined = predefinedAvatars.includes(avatarName);
      
      // Creamos el cuerpo de la solicitud
      const requestBody = { avatar: avatarName };
      
      console.log('Enviando solicitud para actualizar avatar:', { 
        avatarName, 
        isPredefined,
        requestBody 
      });
      
      // Hacemos la petición al servidor
      return this.http.post<{ 
        success: boolean; 
        message: string; 
        data: { 
          avatar_url: string;
          frontend_avatar_url?: string;
          is_predefined?: boolean;
        } 
      }>(
        `${this.apiUrl}/perfil/avatar`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      ).pipe(
        map((response: any) => {
          console.log('Respuesta del servidor (raw):', response);
          
          // Si la respuesta ya tiene la estructura que necesitamos, la devolvemos directamente
          if (response.avatar_url || response.data?.avatar_url) {
            const result = {
              avatar_url: response.avatar_url || response.data.avatar_url,
              frontend_avatar_url: response.frontend_avatar_url || response.data?.frontend_avatar_url,
              is_predefined: response.is_predefined || response.data?.is_predefined
            };
            
            console.log('Datos del avatar a devolver:', result);
            
            // Actualizar el usuario en el almacenamiento local
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser) {
              currentUser.avatar_url = result.avatar_url;
              if (result.is_predefined !== undefined) {
                currentUser.is_predefined = result.is_predefined;
              }
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            
            return result;
          }
          
          // Si no tiene la estructura esperada, lanzamos un error
          console.error('Estructura de respuesta inesperada:', response);
          throw new Error('Error inesperado al actualizar el avatar');
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar el avatar:', error);
          return throwError(() => new Error(error.error?.message || 'Error al actualizar el avatar'));
        })
      );
    } else {
      // Si es un File, es una carga de archivo
      const formData = new FormData();
      formData.append('avatar', file);
      
      return this.http.post<{ 
        success: boolean; 
        message: string; 
        data: { avatar_url: string } 
      }>(
        `${this.apiUrl}/upload-avatar`,
        formData,
        {
          withCredentials: true
        }
      ).pipe(
        map(response => {
          if (response?.success && response.data?.avatar_url) {
            // Actualizar el usuario en el almacenamiento local
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser) {
              currentUser.avatar_url = response.data.avatar_url;
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            return { avatar_url: response.data.avatar_url };
          }
          throw new Error(response?.message || 'Error al subir el avatar');
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al subir el avatar:', error);
          return throwError(() => new Error(error.error?.message || 'Error al subir el avatar'));
        })
      );
    }
  }

  /**
   * Elimina el avatar del usuario
   */
  eliminarAvatar(): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/avatar`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        if (response?.success) {
          // Actualizar el usuario en el almacenamiento local
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (currentUser) {
            currentUser.avatar_url = null;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
          }
        }
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al eliminar el avatar:', error);
        return throwError(() => new Error(error.error?.message || 'Error al eliminar el avatar'));
      })
    );
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
      success: boolean;
      data: {
        puede_cambiar_apodo: boolean;
        dias_restantes: number;
        proximo_cambio_disponible: string;
      };
    }>(`${this.apiUrl}/puede-cambiar-apodo`, { withCredentials: true }).pipe(
      map(response => response?.data || {
        puede_cambiar_apodo: false,
        dias_restantes: 0,
        proximo_cambio_disponible: ''
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al verificar cambio de apodo:', error);
        return throwError(() => new Error(error.error?.message || 'Error al verificar cambio de apodo'));
      })
    );
  }
}

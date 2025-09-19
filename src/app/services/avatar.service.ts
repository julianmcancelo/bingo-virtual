import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  private avatarsPath = 'assets/avatars/';
  private defaultAvatar = 'default-avatar.png';
  private avatarList: string[] = [];

  constructor(private http: HttpClient) {}

  // Cargar la lista de avatares disponibles
  loadAvatars(): Observable<string[]> {
    // Si ya tenemos los avatares cargados, los devolvemos
    if (this.avatarList.length > 0) {
      return of(this.avatarList);
    }

    // En desarrollo, usamos una lista predefinida
    // En un entorno real, podrías hacer una petición al servidor
    // para obtener la lista de avatares disponibles
    try {
      const defaultAvatars = this.getDefaultAvatars();
      this.avatarList = defaultAvatars;
      return of(defaultAvatars);
    } catch (error) {
      console.warn('No se pudo cargar la lista de avatares:', error);
      return of(this.getDefaultAvatars());
    }
  }

  // Obtener una lista de avatares por defecto
  private getDefaultAvatars(): string[] {
    return [
      '16.png',
      'lightning.png',
      'noctis.png',
      'rinoa.png',
      'squall.png'
    ];
  }

  // Obtener la URL completa de un avatar
  getAvatarUrl(avatarName: string): string {
    if (!avatarName) {
      return `${this.avatarsPath}${this.defaultAvatar}`;
    }
    
    // Si ya es una URL completa o empieza con assets/, la devolvemos tal cual
    if (avatarName.startsWith('http') || avatarName.startsWith('assets/')) {
      return avatarName;
    }
    
    // Si es solo el nombre del archivo, construimos la ruta completa
    return `${this.avatarsPath}${avatarName}`;
  }

  // Obtener la lista de avatares con sus URLs completas
  getAvatarUrls(): Observable<string[]> {
    return this.loadAvatars().pipe(
      map(avatars => avatars.map(avatar => this.getAvatarUrl(avatar)))
    );
  }

  // Obtener la lista de nombres de archivo de avatares
  getAvatarList(): Observable<string[]> {
    return this.loadAvatars();
  }
}

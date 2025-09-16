/**
 * SERVICIO DE AUTENTICACIÓN
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Servicio para manejo de autenticación con roles y JWT
 * 
 * COMPLEJIDAD TEMPORAL: 
 * - Login: O(1) - Operación constante
 * - Verificación de roles: O(1) - Búsqueda en Set
 * - Logout: O(1) - Limpieza de estado
 * 
 * COMPLEJIDAD ESPACIAL: O(1) - Almacenamiento constante de usuario y token
 * 
 * ESTRUCTURAS DE DATOS UTILIZADAS:
 * - Set<string>: Para roles del usuario (búsqueda O(1))
 * - BehaviorSubject: Para estado reactivo
 * - Map<string, any>: Para cache de permisos
 */

import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  roles: Set<string>;
  avatar?: string;
  fechaCreacion: Date;
  ultimoAcceso?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Usuario;
  token: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isBrowser: boolean;

  /**
   * ESTADO REACTIVO DEL SERVICIO
   * 
   * @description Uso de BehaviorSubject para mantener estado reactivo
   */
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  // Cache de permisos para optimizar verificaciones repetidas
  private permissionsCache = new Map<string, boolean>();
  
  /**
   * OBSERVABLES PÚBLICOS
   */
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Verificar si hay una sesión guardada al inicializar
    this.checkStoredSession();
  }

  /**
   * INICIAR SESIÓN
   * 
   * @param credentials - Credenciales de acceso
   * @returns Observable<AuthResponse> - Respuesta de autenticación
   * 
   * @complexity O(1) - Operación de autenticación constante
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Simulación de autenticación (en producción sería una llamada HTTP)
    return this.simulateLogin(credentials).pipe(
      tap(response => {
        this.setAuthenticatedUser(response.user, response.token);
        this.saveToStorage(response);
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * CERRAR SESIÓN
   * 
   * @complexity O(1) - Limpieza constante de estado
   */
  logout(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.tokenSubject.next(null);
    this.permissionsCache.clear();
    this.clearStorage();
  }

  /**
   * VERIFICAR SI USUARIO TIENE ROL ESPECÍFICO
   * 
   * @param role - Rol a verificar
   * @returns boolean - true si tiene el rol
   * 
   * @complexity O(1) - Búsqueda en Set es constante
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.roles.has(role) : false;
  }

  /**
   * VERIFICAR MÚLTIPLES ROLES (ANY)
   * 
   * @param roles - Array de roles a verificar
   * @returns boolean - true si tiene al menos uno de los roles
   * 
   * @complexity O(n) donde n es el número de roles a verificar
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    return roles.some(role => user.roles.has(role));
  }

  /**
   * VERIFICAR TODOS LOS ROLES (ALL)
   * 
   * @param roles - Array de roles a verificar
   * @returns boolean - true si tiene todos los roles
   * 
   * @complexity O(n) donde n es el número de roles a verificar
   */
  hasAllRoles(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    return roles.every(role => user.roles.has(role));
  }

  /**
   * OBTENER USUARIO ACTUAL
   * 
   * @returns Usuario | null - Usuario autenticado o null
   */
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * VERIFICAR SI ESTÁ AUTENTICADO
   * 
   * @returns boolean - Estado de autenticación
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * MÉTODOS PRIVADOS
   */

  /**
   * SIMULAR LOGIN (REEMPLAZAR CON HTTP EN PRODUCCIÓN)
   * 
   * @param credentials - Credenciales de acceso
   * @returns Observable<AuthResponse> - Respuesta simulada
   */
  private simulateLogin(credentials: LoginCredentials): Observable<AuthResponse> {
    // Usuarios de prueba para demostración
    const testUsers = new Map([
      ['admin@bingo.com', {
        id: '1',
        nombre: 'Administrador',
        email: 'admin@bingo.com',
        roles: new Set(['admin', 'moderator', 'player']),
        avatar: 'assets/img/admin-avatar.png',
        fechaCreacion: new Date('2024-01-01'),
        password: 'admin123'
      }],
      ['player@bingo.com', {
        id: '2',
        nombre: 'Jugador Demo',
        email: 'player@bingo.com',
        roles: new Set(['player']),
        avatar: 'assets/img/player-avatar.png',
        fechaCreacion: new Date('2024-02-01'),
        password: 'player123'
      }],
      ['moderator@bingo.com', {
        id: '3',
        nombre: 'Moderador',
        email: 'moderator@bingo.com',
        roles: new Set(['moderator', 'player']),
        avatar: 'assets/img/moderator-avatar.png',
        fechaCreacion: new Date('2024-01-15'),
        password: 'mod123'
      }]
    ]);

    // Simular delay de red
    return new Observable(observer => {
      setTimeout(() => {
        const testUser = testUsers.get(credentials.email);
        
        if (testUser && testUser.password === credentials.password) {
          const { password, ...userWithoutPassword } = testUser;
          const response: AuthResponse = {
            user: {
              ...userWithoutPassword,
              ultimoAcceso: new Date()
            },
            token: this.generateMockToken(userWithoutPassword.id),
            refreshToken: this.generateMockToken(userWithoutPassword.id, true)
          };
          observer.next(response);
        } else {
          observer.error({ message: 'Credenciales inválidas' });
        }
        observer.complete();
      }, 1000); // Simular 1 segundo de delay
    });
  }

  /**
   * GENERAR TOKEN SIMULADO
   * 
   * @param userId - ID del usuario
   * @param isRefresh - Si es token de refresh
   * @returns string - Token generado
   */
  private generateMockToken(userId: string, isRefresh = false): string {
    const prefix = isRefresh ? 'refresh_' : 'access_';
    const timestamp = Date.now();
    return `${prefix}${userId}_${timestamp}`;
  }

  /**
   * ESTABLECER USUARIO AUTENTICADO
   * 
   * @param user - Usuario autenticado
   * @param token - Token de acceso
   */
  private setAuthenticatedUser(user: Usuario, token: string): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.tokenSubject.next(token);
  }

  /**
   * VERIFICAR SESIÓN ALMACENADA
   */
  private checkStoredSession(): void {
    if (!this.isBrowser) return;
    
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        // Reconstruir Set de roles
        user.roles = new Set(user.roles);
        user.fechaCreacion = new Date(user.fechaCreacion);
        if (user.ultimoAcceso) {
          user.ultimoAcceso = new Date(user.ultimoAcceso);
        }
        
        this.setAuthenticatedUser(user, storedToken);
      } catch (error) {
        console.error('Error al recuperar sesión:', error);
        this.clearStorage();
      }
    }
  }

  /**
   * GUARDAR EN ALMACENAMIENTO LOCAL
   * 
   * @param response - Respuesta de autenticación
   */
  private saveToStorage(response: AuthResponse): void {
    if (!this.isBrowser) return;
    
    const userToStore = {
      ...response.user,
      roles: Array.from(response.user.roles)
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userToStore));
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
  }

  /**
   * LIMPIAR ALMACENAMIENTO LOCAL
   */
  private clearStorage(): void {
    if (!this.isBrowser) return;
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
}

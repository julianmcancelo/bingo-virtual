import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, take, tap, finalize, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface User {
  id: number;
  nombre_usuario: string;
  nombre?: string;
  email: string;
  token: string;
  avatar?: string;
  fechaCreacion?: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  public redirectUrl: string | null = null;
  
  private refreshTokenTimeout: any;
  private jwtHelper = new JwtHelperService();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    // Start token refresh timer if user is already logged in
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user?.token) {
        this.scheduleTokenRefresh();
      }
    });
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getUserFromStorage(): User | null {
    if (!this.isBrowser()) return null;
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  private setUserInStorage(user: User | null): void {
    if (!this.isBrowser()) {
      this.currentUserSubject.next(user);
      return;
    }
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', user.token);
      this.scheduleTokenRefresh();
    } else {
      this.stopTokenRefreshTimer();
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(user);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  getToken(): string | null {
    const user = this.currentUserValue;
    return user?.token || null;
  }
  
  private lastTokenRefreshTime: number = 0;
  private readonly TOKEN_REFRESH_COOLDOWN = 30000; // 30 seconds cooldown

  private scheduleTokenRefresh() {
    const token = this.getToken();
    if (!token) return;
    
    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      if (!decodedToken?.exp) return;
      
      // Calculate when the token will expire (1 minute before actual expiration)
      const expiresAt = (decodedToken.exp * 1000) - 60000;
      const now = Date.now();
      
      // Don't schedule if token is already expired
      if (expiresAt <= now) return;
      
      // Calculate time until refresh should happen
      const timeUntilRefresh = expiresAt - now;
      
      // Don't schedule if refresh is already scheduled or if we're in cooldown
      const timeSinceLastRefresh = now - this.lastTokenRefreshTime;
      if (this.refreshTokenTimeout || timeSinceLastRefresh < this.TOKEN_REFRESH_COOLDOWN) {
        return;
      }
      
      console.log(`Scheduling token refresh in ${Math.floor(timeUntilRefresh / 1000)} seconds`);
      
      // Clear any existing timeout just to be safe
      this.stopTokenRefreshTimer();
      
      this.refreshTokenTimeout = setTimeout(() => {
        this.refreshToken().subscribe({
          next: () => {
            this.lastTokenRefreshTime = Date.now();
          },
          error: (error) => {
            console.error('Error during scheduled token refresh:', error);
            this.lastTokenRefreshTime = Date.now(); // Still update to prevent immediate retry
          }
        });
      }, timeUntilRefresh);
      
    } catch (error) {
      console.error('Error al programar la actualización del token:', error);
    }
  }
  
  private stopTokenRefreshTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }
  
  private isRefreshing = false;
  private refreshPromise: Observable<any> | null = null;

  refreshToken(): Observable<any> {
    // If we're already refreshing, return the existing promise
    if (this.isRefreshing) {
      return this.refreshPromise!;
    }

    const token = this.getToken();
    if (!token) {
      console.warn('No hay token disponible para refrescar');
      return of(null);
    }
    
    console.log('Iniciando refresco de token...');
    this.isRefreshing = true;
    
    this.refreshPromise = this.http.post<any>(
      `${this.apiUrl}/auth/refresh-token`, 
      {},
      {
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    ).pipe(
      tap({
        next: (response) => {
          console.log('Token refrescado exitosamente');
          if (response?.token) {
            const user = this.currentUserValue;
            if (user) {
              user.token = response.token;
              this.setUserInStorage(user);
            }
          }
        },
        error: (error) => {
          console.error('Error al refrescar el token:', error);
          if (error.status === 401 || error.status === 500) {
            console.warn('Sesión expirada, cerrando sesión...');
            this.logout();
          }
        },
        finalize: () => {
          this.isRefreshing = false;
          this.refreshPromise = null;
        }
      }),
      // Share the observable to prevent multiple subscriptions from triggering multiple requests
      shareReplay(1)
    );

    return this.refreshPromise;
  }

  login(email: string, password: string): Observable<any> {
    console.log('Iniciando sesión con:', { email });
    
    return this.http.post<any>(
      `${this.apiUrl}/auth/iniciar-sesion`, 
      { 
        email: email.trim(), 
        contrasena: password 
      },
      {
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    ).pipe(
      tap((response: any) => {
        console.log('Respuesta de inicio de sesión:', response);
        
        if (!response) {
          throw new Error('No se recibió respuesta del servidor');
        }
        
        if (response.estado === 'error') {
          throw new Error(response.mensaje || 'Error al iniciar sesión');
        }
        
        if (!response.token) {
          throw new Error('No se recibió un token de autenticación en la respuesta');
        }
        
        const userData = response.datos?.usuario || response.usuario || {};
        
        const user = {
          id: userData.id || 0,
          nombre_usuario: userData.nombre_usuario || email.split('@')[0],
          email: userData.email || email,
          token: response.token
        };
        
        console.log('Usuario autenticado:', user);
        this.setUserInStorage(user);
        
        // Redirigir a la URL almacenada o a la ruta por defecto
        const redirectUrl = this.redirectUrl || '/bingo';
        this.redirectUrl = null; // Limpiar la URL almacenada
        console.log('Redirigiendo a:', redirectUrl);
        this.router.navigateByUrl(redirectUrl);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en inicio de sesión:', error);
        let errorMessage = 'Error al iniciar sesión';
        
        if (error.status === 401) {
          errorMessage = 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar al servidor. Por favor, verifica tu conexión.';
        } else if (error.error?.mensaje) {
          errorMessage = error.error.mensaje;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  register(nombre_usuario: string, email: string, password: string, confirmar_contrasena: string): Observable<any> {
    console.log('Registrando nuevo usuario:', { email, nombre_usuario });
    
    return this.http.post(
      `${this.apiUrl}/auth/registro`, 
      {
        nombre_usuario: nombre_usuario.trim(),
        email: email.trim().toLowerCase(),
        contrasena: password,
        confirmar_contrasena
      },
      {
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    ).pipe(
      tap((response: any) => {
        console.log('Respuesta de registro:', response);
        
        if (!response) {
          throw new Error('No se recibió respuesta del servidor');
        }
        
        if (response.estado === 'error') {
          throw new Error(response.mensaje || 'Error en el registro');
        }
        
        if (!response.token) {
          throw new Error('No se recibió un token de autenticación en la respuesta');
        }
        
        const userData = response.datos?.usuario || response.usuario || {};
        
        const user = {
          id: userData.id || 0,
          nombre_usuario: userData.nombre_usuario || nombre_usuario,
          email: userData.email || email,
          token: response.token
        };
        
        console.log('Usuario registrado y autenticado:', user);
        this.setUserInStorage(user);
        
        // Redirigir a la página principal después del registro exitoso
        this.router.navigate(['/bingo']);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en el registro:', error);
        let errorMessage = 'Error al registrar el usuario';
        
        if (error.status === 400 || error.status === 409) {
          // Errores de validación o usuario/email ya existente
          errorMessage = error.error?.mensaje || errorMessage;
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar al servidor. Por favor, verifica tu conexión.';
        } else if (error.error?.errors) {
          // Manejar errores de validación del servidor
          const validationErrors = error.error.errors;
          errorMessage = Object.values(validationErrors).flat().join(' ');
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(redirectToLogin: boolean = true): void {
    console.log('Iniciando cierre de sesión...');
    
    const token = this.getToken();
    
    const completeLogout = () => {
      this.stopTokenRefreshTimer();
      
      if (this.isBrowser()) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        sessionStorage.clear();
      }
      
      this.currentUserSubject.next(null);
      
      if (redirectToLogin) {
        console.log('Redirigiendo a la página de inicio de sesión...');
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: this.router.routerState.snapshot.url }
        });
      }
      
      console.log('Sesión cerrada correctamente');
    };
    
    if (token) {
      console.log('Enviando solicitud de cierre de sesión al servidor...');
      
      this.http.post(
        `${this.apiUrl}/auth/cerrar-sesion`, 
        {},
        {
          headers: this.getAuthHeaders(),
          withCredentials: true
        }
      ).subscribe({
        next: () => {
          console.log('Sesión cerrada en el servidor');
          completeLogout();
        },
        error: (error) => {
          console.error('Error al cerrar sesión en el servidor:', error);
          completeLogout();
        }
      });
    } else {
      console.log('No hay token de autenticación, cerrando sesión localmente');
      completeLogout();
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
}

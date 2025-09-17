import { Injectable, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface User {
  id: number;
  nombre_usuario: string;
  email: string;
  token: string;
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private router: Router) {
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
  
  private scheduleTokenRefresh() {
    const token = this.getToken();
    if (!token) return;
    
    // Parse the JWT token to get expiration time
    const decodedToken = this.jwtHelper.decodeToken(token);
    if (!decodedToken?.exp) return;
    
    // Set timeout to refresh the token 1 minute before it expires
    const expiresIn = (decodedToken.exp * 1000) - Date.now() - 60000;
    
    // Clear any existing timeout
    this.stopTokenRefreshTimer();
    
    if (expiresIn > 0) {
      this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), expiresIn);
    } else {
      // Token is already expired or about to expire, refresh immediately
      this.refreshToken().subscribe();
    }
  }
  
  private stopTokenRefreshTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }
  
  refreshToken(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }
    
    return this.http.post<any>(`${this.apiUrl}/auth/refresh-token`, {}, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    }).pipe(
      tap(response => {
        if (response?.token) {
          const user = this.currentUserValue;
          if (user) {
            // Update the token in the current user
            user.token = response.token;
            this.setUserInStorage(user);
          }
        }
      }),
      catchError(error => {
        // If refresh token fails, log the user out
        if (error.status === 401) {
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/iniciar-sesion`, { email, password }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          const user = {
            id: response.usuario?.id || 0,
            nombre_usuario: response.usuario?.nombre_usuario || email.split('@')[0],
            email: response.usuario?.email || email,
            token: response.token
          };
          this.setUserInStorage(user);
          
          // Redirect to the stored URL or default route
          const redirectUrl = this.redirectUrl || '/bingo';
          this.redirectUrl = null; // Clear the stored URL
          this.router.navigateByUrl(redirectUrl);
        } else {
          throw new Error('No se recibió un token de autenticación');
        }
      })
    );
  }

  register(nombre_usuario: string, email: string, password: string, confirmar_contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro`, {
      nombre_usuario,
      email,
      contrasena: password,
      confirmar_contrasena
    }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          const user = {
            id: response.usuario?.id || 0,
            nombre_usuario: response.usuario?.nombre_usuario || nombre_usuario,
            email: response.usuario?.email || email,
            token: response.token
          };
          this.setUserInStorage(user);
        }
        return response;
      })
    );
  }

  logout(): void {
    // Call the server to invalidate the token
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/auth/cerrar-sesion`, {}, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      }).subscribe({
        next: () => {
          this.completeLogout();
        },
        error: () => {
          // Even if the server call fails, ensure we clean up locally
          this.completeLogout();
        }
      });
    } else {
      this.completeLogout();
    }
  }
  
  private completeLogout(): void {
    this.stopTokenRefreshTimer();
    this.setUserInStorage(null);
    this.router.navigate(['/']);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}

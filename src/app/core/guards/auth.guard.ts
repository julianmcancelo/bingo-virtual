/**
 * GUARD DE AUTENTICACIÓN
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Guard para proteger rutas que requieren autenticación
 * 
 * COMPLEJIDAD TEMPORAL: O(1) - Verificación constante del estado de autenticación
 * COMPLEJIDAD ESPACIAL: O(1) - Almacenamiento constante de estado
 * 
 * PATRONES IMPLEMENTADOS:
 * - Guard Pattern: Protección de rutas
 * - Singleton: Una instancia del servicio de autenticación
 */

import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * VERIFICAR ACCESO A RUTA PROTEGIDA
   * 
   * @param route - Información de la ruta activada
   * @param state - Estado del router
   * @returns Observable<boolean> - true si puede acceder, false si no
   * 
   * @complexity O(1) - Verificación directa del estado de autenticación
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          // Redirigir al login si no está autenticado
          this.router.navigate(['/auth/login'], { 
            queryParams: { returnUrl: state.url } 
          });
          return false;
        }
      })
    );
  }
}

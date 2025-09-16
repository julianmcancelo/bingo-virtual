/**
 * RUTAS DE AUTENTICACIÓN
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Rutas con Lazy Loading para el módulo de autenticación
 */

import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/auth-login/auth-login.component')
      .then(m => m.AuthLoginComponent),
    title: 'Iniciar Sesión - Bingo Virtual'
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth-register/auth-register.component')
      .then(m => m.AuthRegisterComponent),
    title: 'Registrarse - Bingo Virtual'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

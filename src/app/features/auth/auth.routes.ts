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
    loadComponent: () => import('./components/auth-form/auth-form.component')
      .then(m => m.AuthFormComponent),
    title: 'Iniciar Sesión - Bingo Virtual',
    data: { isLogin: true }
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth-form/auth-form.component')
      .then(m => m.AuthFormComponent),
    title: 'Registrarse - Bingo Virtual',
    data: { isLogin: false }
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

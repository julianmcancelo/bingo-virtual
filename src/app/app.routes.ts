/**
 * CONFIGURACIÓN DE RUTAS PRINCIPALES
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Configuración de rutas con Lazy Loading para optimización de carga
 * 
 * LAZY LOADING: O(1) - Carga bajo demanda de módulos
 * TREE SHAKING: Optimización automática del bundle
 */

import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/welcome/welcome.component').then(m => m.WelcomeComponent),
    title: 'Bienvenido - Bingo Virtual',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'bingo',
    loadComponent: () => import('./app.component').then(m => m.AppComponent),
    title: 'Bingo Virtual - ALED3'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
    title: 'Autenticación - Bingo Virtual'
  },
  {
    path: 'estadisticas',
    loadChildren: () => import('./features/estadisticas/estadisticas.routes').then(m => m.estadisticasRoutes),
    canActivate: [AuthGuard],
    title: 'Estadísticas - Bingo Virtual'
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [AuthGuard],
    title: 'Administración - Bingo Virtual'
  },
  {
    path: '**',
    redirectTo: ''
  }
];

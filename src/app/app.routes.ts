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
import { authGuard } from './guards/auth.guard';

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
    loadComponent: () => import('./components/bingo-game/bingo-game.component').then(m => m.BingoGameComponent),
    title: 'Jugar - Bingo Virtual'
  },
  {
    path: 'about',
    loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'estadisticas',
    loadChildren: () => import('./features/estadisticas/estadisticas.routes').then(m => m.estadisticasRoutes),
    canActivate: [authGuard],
    title: 'Estadísticas - Bingo Virtual'
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [authGuard],
    title: 'Administración - Bingo Virtual'
  },
  {
    path: '**',
    redirectTo: ''
  }
];

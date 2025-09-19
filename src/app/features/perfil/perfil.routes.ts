/**
 * Rutas del módulo de Perfil
 * 
 * @file perfil.routes.ts
 * @description Configuración de rutas del módulo de perfil con Lazy Loading
 * 
 * @author Julián Cancelo <julian.cancelo@alumnos.info.unlp.edu.ar>
 * @author Nicolás Otero <nicolas.otero@alumnos.info.unlp.edu.ar>
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @instituto Instituto Beltran
 * @fecha Septiembre 2024
 */

import { Routes } from '@angular/router';

export const perfilRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/perfil-page/perfil-page.component').then(m => m.PerfilPageComponent),
    title: 'Mi Perfil - Bingo Virtual',
    data: {
      breadcrumb: 'Mi Perfil'
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/perfil-page/perfil-page.component').then(m => m.PerfilPageComponent),
    title: 'Perfil Público - Bingo Virtual',
    data: {
      breadcrumb: 'Perfil Público',
      isPublic: true
    }
  }
];

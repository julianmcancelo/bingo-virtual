/**
 * RUTAS DE ADMINISTRACIÓN
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Rutas con Lazy Loading para administración del bingo
 */

import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent),
    title: 'Panel de Administración - Bingo Virtual'
  },
  {
    path: 'salas',
    loadComponent: () => import('./components/gestionar-salas/gestionar-salas.component')
      .then(m => m.GestionarSalasComponent),
    title: 'Gestionar Salas - Bingo Virtual'
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./components/gestionar-usuarios/gestionar-usuarios.component')
      .then(m => m.GestionarUsuariosComponent),
    title: 'Gestionar Usuarios - Bingo Virtual'
  }
];

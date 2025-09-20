/**
 * RUTAS DE ESTADÍSTICAS
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Rutas con Lazy Loading para estadísticas del bingo
 * 
 * COMPONENTES STANDALONE: Todos los componentes de estadísticas son independientes
 * y se cargan bajo demanda para mejorar el rendimiento.
 */

import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';

export const estadisticasRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/estadisticas-dashboard/estadisticas-dashboard.component')
      .then(m => m.EstadisticasDashboardComponent),
    title: 'Dashboard de Estadísticas - Bingo Virtual',
    canActivate: [authGuard],
    data: { roles: ['usuario', 'admin'] }
  },
  {
    path: 'rankings',
    loadComponent: () => import('./components/rankings/rankings.component')
      .then(m => m.RankingsComponent),
    title: 'Rankings - Bingo Virtual',
    canActivate: [authGuard],
    data: { roles: ['usuario', 'admin'] }
  },
  {
    path: 'historial',
    loadComponent: () => import('./components/historial-partidas/historial-partidas.component')
      .then(m => m.HistorialPartidasComponent),
    title: 'Historial de Partidas - Bingo Virtual',
    canActivate: [authGuard],
    data: { roles: ['usuario', 'admin'] }
  },
  // Ruta por defecto para redireccionar a la página principal de estadísticas
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

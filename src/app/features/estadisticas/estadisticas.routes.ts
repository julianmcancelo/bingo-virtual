/**
 * RUTAS DE ESTADÍSTICAS
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Rutas con Lazy Loading para estadísticas del bingo
 */

import { Routes } from '@angular/router';

export const estadisticasRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/estadisticas-dashboard/estadisticas-dashboard.component')
      .then(m => m.EstadisticasDashboardComponent),
    title: 'Dashboard de Estadísticas - Bingo Virtual'
  },
  {
    path: 'rankings',
    loadComponent: () => import('./components/rankings/rankings.component')
      .then(m => m.RankingsComponent),
    title: 'Rankings - Bingo Virtual'
  },
  {
    path: 'historial',
    loadComponent: () => import('./components/historial-partidas/historial-partidas.component')
      .then(m => m.HistorialPartidasComponent),
    title: 'Historial de Partidas - Bingo Virtual'
  }
];

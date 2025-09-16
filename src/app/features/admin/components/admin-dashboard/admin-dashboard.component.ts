/**
 * COMPONENTE DASHBOARD DE ADMINISTRACIÓN
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Dashboard administrativo con métricas del sistema
 * 
 * COMPLEJIDAD TEMPORAL: O(n) - Cálculo de métricas del sistema
 * COMPLEJIDAD ESPACIAL: O(1) - Almacenamiento constante de métricas
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';

interface MetricaAdmin {
  label: string;
  valor: number;
  icono: string;
  color: string;
  cambio: number;
  descripcion: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
              <p class="text-gray-600">Gestión y monitoreo del sistema de bingo virtual</p>
            </div>
            <button mat-raised-button color="primary" (click)="goToBingo()">
              <mat-icon>casino</mat-icon>
              Volver al Bingo
            </button>
          </div>
        </div>

        <!-- Métricas Principales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <mat-card *ngFor="let metrica of metricas" class="metric-card">
            <mat-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">{{ metrica.label }}</p>
                  <p class="text-2xl font-bold" [style.color]="metrica.color">{{ metrica.valor }}</p>
                  <div class="flex items-center mt-1">
                    <span class="text-xs" 
                          [ngClass]="metrica.cambio >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ metrica.cambio >= 0 ? '+' : '' }}{{ metrica.cambio }}%
                    </span>
                    <span class="text-xs text-gray-500 ml-2">{{ metrica.descripcion }}</span>
                  </div>
                </div>
                <mat-icon [style.color]="metrica.color" class="text-3xl">{{ metrica.icono }}</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Acciones Rápidas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <mat-card class="action-card cursor-pointer" (click)="gestionarSalas()">
            <mat-card-content class="p-6 text-center">
              <mat-icon class="text-4xl text-blue-600 mb-4">meeting_room</mat-icon>
              <h3 class="text-lg font-semibold mb-2">Gestionar Salas</h3>
              <p class="text-sm text-gray-600">Crear, modificar y eliminar salas de bingo</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="action-card cursor-pointer" (click)="gestionarUsuarios()">
            <mat-card-content class="p-6 text-center">
              <mat-icon class="text-4xl text-green-600 mb-4">people</mat-icon>
              <h3 class="text-lg font-semibold mb-2">Gestionar Usuarios</h3>
              <p class="text-sm text-gray-600">Administrar cuentas y permisos de usuarios</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="action-card cursor-pointer" (click)="verReportes()">
            <mat-card-content class="p-6 text-center">
              <mat-icon class="text-4xl text-purple-600 mb-4">analytics</mat-icon>
              <h3 class="text-lg font-semibold mb-2">Reportes</h3>
              <p class="text-sm text-gray-600">Estadísticas detalladas del sistema</p>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Actividad Reciente -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Actividad Reciente del Sistema</mat-card-title>
            <mat-card-subtitle>Últimas acciones administrativas</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="p-6">
            <div class="space-y-4">
              <div class="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <mat-icon class="text-blue-600">add_circle</mat-icon>
                <div class="flex-1">
                  <p class="font-medium">Nueva sala creada</p>
                  <p class="text-sm text-gray-600">Sala "Navidad 2024" - hace 2 horas</p>
                </div>
              </div>
              <div class="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <mat-icon class="text-green-600">person_add</mat-icon>
                <div class="flex-1">
                  <p class="font-medium">Nuevo usuario registrado</p>
                  <p class="text-sm text-gray-600">usuario&#64;ejemplo.com - hace 4 horas</p>
                </div>
              </div>
              <div class="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                <mat-icon class="text-yellow-600">warning</mat-icon>
                <div class="flex-1">
                  <p class="font-medium">Mantenimiento programado</p>
                  <p class="text-sm text-gray-600">Actualización del servidor - mañana 02:00</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .metric-card {
      transition: transform 0.2s ease-in-out;
    }
    
    .metric-card:hover {
      transform: translateY(-2px);
    }
    
    .action-card {
      transition: all 0.2s ease-in-out;
    }
    
    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  
  metricas: MetricaAdmin[] = [
    {
      label: 'Usuarios Activos',
      valor: 247,
      icono: 'people',
      color: '#3B82F6',
      cambio: 12.5,
      descripcion: 'vs mes anterior'
    },
    {
      label: 'Salas Activas',
      valor: 18,
      icono: 'meeting_room',
      color: '#10B981',
      cambio: 8.3,
      descripcion: 'en tiempo real'
    },
    {
      label: 'Partidas Hoy',
      valor: 156,
      icono: 'casino',
      color: '#8B5CF6',
      cambio: -2.1,
      descripcion: 'vs ayer'
    },
    {
      label: 'Uptime Sistema',
      valor: 99.8,
      icono: 'speed',
      color: '#F59E0B',
      cambio: 0.2,
      descripcion: '% disponibilidad'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarMetricas();
  }

  private cargarMetricas(): void {
    // En una implementación real, aquí se cargarían las métricas del servidor
    console.log('Métricas administrativas cargadas');
  }

  gestionarSalas(): void {
    this.router.navigate(['/admin/salas']);
  }

  gestionarUsuarios(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  verReportes(): void {
    this.router.navigate(['/estadisticas']);
  }

  goToBingo(): void {
    this.router.navigate(['/bingo']);
  }
}

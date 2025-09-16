/**
 * COMPONENTE GESTIÓN DE SALAS
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Componente administrativo para gestión de salas
 * 
 * COMPLEJIDAD TEMPORAL: O(n) - Operaciones CRUD sobre salas
 * COMPLEJIDAD ESPACIAL: O(n) - Almacenamiento de salas
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestionar-salas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Gestionar Salas</h1>
              <p class="text-gray-600">Administración de salas de bingo</p>
            </div>
            <button mat-raised-button color="primary" (click)="goToAdmin()">
              <mat-icon>arrow_back</mat-icon>
              Volver al Admin
            </button>
          </div>
        </div>

        <mat-card>
          <mat-card-content class="p-8 text-center">
            <mat-icon class="text-6xl text-gray-400 mb-4">construction</mat-icon>
            <h2 class="text-xl font-semibold mb-4">Próximamente</h2>
            <p class="text-gray-600">La gestión de salas estará disponible en una futura actualización.</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class GestionarSalasComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {}

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}

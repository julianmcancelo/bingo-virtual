/**
 * COMPONENTE DE REGISTRO
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Componente standalone para registro de nuevos usuarios
 * 
 * COMPLEJIDAD TEMPORAL: O(1) - Validaciones constantes
 * COMPLEJIDAD ESPACIAL: O(1) - Almacenamiento constante
 */

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <mat-card class="w-full max-w-md">
        <mat-card-header class="text-center pb-4">
          <mat-card-title class="text-2xl font-bold text-gray-800">
            Registrarse
          </mat-card-title>
          <mat-card-subtitle class="text-gray-600">
            Próximamente disponible
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="text-center py-8">
          <mat-icon class="text-6xl text-gray-400 mb-4">construction</mat-icon>
          <p class="text-gray-600 mb-4">
            El registro de usuarios estará disponible en una futura actualización.
          </p>
          <p class="text-sm text-gray-500">
            Por ahora, puedes usar las cuentas de prueba disponibles en el login.
          </p>
        </mat-card-content>

        <mat-card-actions class="flex justify-between p-4">
          <button mat-button (click)="goToLogin()" color="primary">
            <mat-icon>arrow_back</mat-icon>
            Volver al Login
          </button>
          <button mat-button (click)="goToBingo()" color="accent">
            Ir al Bingo
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    mat-card {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border-radius: 16px;
    }
  `]
})
export class AuthRegisterComponent implements OnInit {

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    // Componente placeholder para futuras implementaciones
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToBingo(): void {
    this.router.navigate(['/bingo']);
  }
}

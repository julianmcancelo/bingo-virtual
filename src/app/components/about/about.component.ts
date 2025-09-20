/**
 * COMPONENTE INFORMACIÓN DEL PROYECTO
 *
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @instituto Instituto Tecnológico Beltrán (ITB)
 * @ubicacion Avellaneda Buenos Aires Argentina
 * @año 2025
 * @descripcion Componente que muestra información detallada del proyecto final
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './about.component.html',
  styleUrls: []
})
export class AboutComponent {

  constructor() {
    console.log('AboutComponent initialized - Proyecto ALED3 by Julián Cancelo & Nicolás Otero');
  }
}

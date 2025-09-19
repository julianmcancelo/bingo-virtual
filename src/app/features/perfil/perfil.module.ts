/**
 * Módulo de Perfil de Usuario
 * 
 * @module PerfilModule
 * @description Módulo que gestiona la funcionalidad del perfil de usuario
 * 
 * @author Julián Cancelo <julian.cancelo@alumnos.info.unlp.edu.ar>
 * @author Nicolás Otero <nicolas.otero@alumnos.info.unlp.edu.ar>
 * 
 * @requires @angular/core
 * @requires @angular/common
 * @requires @angular/forms
 * @requires @angular/router
 * @requires @angular/material
 */

import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

// Servicios
import { PerfilService } from './services/perfil.service';
import { AvatarService } from '../../services/avatar.service';

// Rutas
import { perfilRoutes } from './perfil.routes';

@NgModule({
  declarations: [],
  providers: [
    DatePipe,
    PerfilService,
    AvatarService
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(perfilRoutes),
    
    // Angular Material
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule
  ]
})
export class PerfilModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

// Componentes
import { EstadisticasDashboardComponent } from './components/estadisticas-dashboard/estadisticas-dashboard.component';

// Servicios
import { EstadisticasService } from '../../services/estadisticas.service';

// Importamos las rutas definidas en el archivo de rutas
import { estadisticasRoutes } from './estadisticas.routes';

@NgModule({
  declarations: [
    // Solo declaramos componentes que no son standalone
    // Los componentes standalone se importan directamente en las rutas
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(estadisticasRoutes),
    // Angular Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatListModule,
    MatChipsModule,
    MatTooltipModule
  ],
  providers: [
    EstadisticasService,
    DatePipe
  ]
})
export class EstadisticasModule { }

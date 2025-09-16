/**
 * COMPONENTE INFORMACIÓN DEL PROYECTO
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @instituto Instituto Tecnológico Beltrán (ITB)
 * @ubicacion Avellaneda, Buenos Aires, Argentina
 * @año 2025
 * @descripcion Componente que muestra información detallada del proyecto final
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="about-container p-6 max-w-6xl mx-auto">
      <!-- Header del Proyecto -->
      <mat-card class="project-header mb-6">
        <mat-card-header>
          <div mat-card-avatar class="project-avatar">
            <mat-icon>school</mat-icon>
          </div>
          <mat-card-title class="text-2xl font-bold text-blue-600">
            Bingo Virtual Educativo - ALED3
          </mat-card-title>
          <mat-card-subtitle class="text-lg">
            Trabajo Final - Instituto Tecnológico Beltrán
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content class="mt-4">
          <p class="text-gray-700 text-lg leading-relaxed">
            Aplicación web interactiva de bingo multijugador desarrollada como proyecto final 
            para la materia ALED3 en el Instituto Tecnológico Beltrán, implementando patrones 
            de diseño avanzados y algoritmos de estructuras de datos complejas.
          </p>
          
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 class="font-bold text-blue-800 mb-2">🏛️ Sobre el Instituto Tecnológico Beltrán</h3>
            <p class="text-blue-700 text-sm">
              Centro de Tecnología e Innovación ubicado en Avellaneda, Buenos Aires. 
              Ofrece más de 9 tecnicaturas incluyendo Sistemas, Comunicación Multimedial, 
              Diseño Industrial, y la nueva tecnicatura en Ciencia de Datos e Inteligencia Artificial.
            </p>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Información Académica -->
        <mat-card class="academic-info">
          <mat-card-header>
            <mat-card-title class="flex items-center">
              <mat-icon class="mr-2 text-blue-600">account_balance</mat-icon>
              Información Académica
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="space-y-4">
              <div class="info-item">
                <strong class="text-blue-600">Instituto:</strong>
                <p>Instituto Tecnológico Beltrán (ITB)</p>
              </div>
              
              <div class="info-item">
                <strong class="text-blue-600">Ubicación:</strong>
                <p>Av. Belgrano 1191, Avellaneda – Buenos Aires – Argentina</p>
              </div>
              
              <div class="info-item">
                <strong class="text-blue-600">Contacto:</strong>
                <p>📞 (+54.11) 4265.0247 / 4265.0342 / 4203.0134</p>
                <p>📧 informes&#64;ibeltran.com.ar</p>
              </div>
              
              <div class="info-item">
                <strong class="text-blue-600">Materia:</strong>
                <p>Algoritmos y Estructuras de Datos III (ALED3)</p>
              </div>
              
              <div class="info-item">
                <strong class="text-blue-600">Profesor:</strong>
                <p>Sebastián Saldivar</p>
              </div>
              
              <div class="info-item">
                <strong class="text-blue-600">Año Académico:</strong>
                <p>2025</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Información de Autores -->
        <mat-card class="authors-info">
          <mat-card-header>
            <mat-card-title class="flex items-center">
              <mat-icon class="mr-2 text-green-600">group</mat-icon>
              Autores del Proyecto
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="space-y-6">
              <div class="author-card p-4 bg-blue-50 rounded-lg">
                <div class="flex items-center mb-2">
                  <mat-icon class="mr-2 text-blue-600">person</mat-icon>
                  <h3 class="font-bold text-lg">Julián Manuel Cancelo</h3>
                </div>
                <p class="text-gray-600">Estudiante de Tecnicatura en Sistemas - ITB</p>
                <p class="text-sm text-gray-500 mt-1">Especialización en Angular y Node.js</p>
                <p class="text-xs text-blue-600 mt-1">📧 juliancancelo&#64;gmail.com</p>
              </div>
              
              <div class="author-card p-4 bg-green-50 rounded-lg">
                <div class="flex items-center mb-2">
                  <mat-icon class="mr-2 text-green-600">person</mat-icon>
                  <h3 class="font-bold text-lg">Nicolás Otero</h3>
                </div>
                <p class="text-gray-600">Estudiante de Tecnicatura en Sistemas - ITB</p>
                <p class="text-sm text-gray-500 mt-1">Especialización en Algoritmos y Estructuras de Datos</p>
                <p class="text-xs text-green-600 mt-1">📧 nicolasotero&#64;gmail.com</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tecnologías Utilizadas -->
      <mat-card class="technologies mt-6">
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-purple-600">code</mat-icon>
            Tecnologías y Herramientas
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div class="tech-category">
              <h4 class="font-bold text-blue-600 mb-3">Frontend</h4>
              <div class="flex flex-wrap gap-2">
                <mat-chip-set>
                  <mat-chip>Angular 17</mat-chip>
                  <mat-chip>TypeScript</mat-chip>
                  <mat-chip>Angular Material</mat-chip>
                  <mat-chip>Tailwind CSS</mat-chip>
                  <mat-chip>RxJS</mat-chip>
                </mat-chip-set>
              </div>
            </div>
            
            <div class="tech-category">
              <h4 class="font-bold text-green-600 mb-3">Backend</h4>
              <div class="flex flex-wrap gap-2">
                <mat-chip-set>
                  <mat-chip>Node.js</mat-chip>
                  <mat-chip>Express.js</mat-chip>
                  <mat-chip>Socket.IO</mat-chip>
                  <mat-chip>TypeScript</mat-chip>
                </mat-chip-set>
              </div>
            </div>
            
            <div class="tech-category">
              <h4 class="font-bold text-purple-600 mb-3">Herramientas</h4>
              <div class="flex flex-wrap gap-2">
                <mat-chip-set>
                  <mat-chip>Git</mat-chip>
                  <mat-chip>npm</mat-chip>
                  <mat-chip>Angular CLI</mat-chip>
                  <mat-chip>Vercel</mat-chip>
                </mat-chip-set>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Características del Proyecto -->
      <mat-card class="features mt-6">
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-orange-600">star</mat-icon>
            Características Implementadas
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div class="feature-item flex items-start">
              <mat-icon class="mr-3 mt-1 text-green-500">check_circle</mat-icon>
              <div>
                <h4 class="font-semibold">Multijugador en Tiempo Real</h4>
                <p class="text-gray-600 text-sm">Comunicación WebSocket con Socket.IO</p>
              </div>
            </div>
            
            <div class="feature-item flex items-start">
              <mat-icon class="mr-3 mt-1 text-green-500">check_circle</mat-icon>
              <div>
                <h4 class="font-semibold">Patrones de Diseño</h4>
                <p class="text-gray-600 text-sm">Singleton, Observer, Factory, Strategy</p>
              </div>
            </div>
            
            <div class="feature-item flex items-start">
              <mat-icon class="mr-3 mt-1 text-green-500">check_circle</mat-icon>
              <div>
                <h4 class="font-semibold">Algoritmos Avanzados</h4>
                <p class="text-gray-600 text-sm">Búsqueda, ordenamiento, estructuras de datos</p>
              </div>
            </div>
            
            <div class="feature-item flex items-start">
              <mat-icon class="mr-3 mt-1 text-green-500">check_circle</mat-icon>
              <div>
                <h4 class="font-semibold">Responsive Design</h4>
                <p class="text-gray-600 text-sm">Adaptable a dispositivos móviles y desktop</p>
              </div>
            </div>
            
            <div class="feature-item flex items-start">
              <mat-icon class="mr-3 mt-1 text-green-500">check_circle</mat-icon>
              <div>
                <h4 class="font-semibold">Autenticación</h4>
                <p class="text-gray-600 text-sm">Sistema de usuarios con JWT</p>
              </div>
            </div>
            
            <div class="feature-item flex items-start">
              <mat-icon class="mr-3 mt-1 text-green-500">check_circle</mat-icon>
              <div>
                <h4 class="font-semibold">Estadísticas</h4>
                <p class="text-gray-600 text-sm">Análisis de rendimiento y métricas</p>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Objetivos Académicos -->
      <mat-card class="objectives mt-6">
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-red-600">flag</mat-icon>
            Objetivos Académicos Cumplidos
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="space-y-4 mt-4">
            <div class="objective-item">
              <h4 class="font-semibold text-blue-600">📚 Implementación de Estructuras de Datos</h4>
              <p class="text-gray-700">Arrays multidimensionales, colas, pilas, y estructuras personalizadas para el manejo del juego.</p>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="objective-item">
              <h4 class="font-semibold text-green-600">🔍 Algoritmos de Búsqueda y Ordenamiento</h4>
              <p class="text-gray-700">Implementación de algoritmos de búsqueda lineal, filtrado avanzado, y ordenamiento de estadísticas.</p>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="objective-item">
              <h4 class="font-semibold text-purple-600">🏗️ Patrones de Diseño</h4>
              <p class="text-gray-700">Aplicación práctica de patrones como Singleton, Observer, Factory, y Strategy en un proyecto real.</p>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="objective-item">
              <h4 class="font-semibold text-orange-600">⚡ Análisis de Complejidad</h4>
              <p class="text-gray-700">Documentación detallada de complejidad temporal y espacial de cada algoritmo implementado.</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Footer -->
      <div class="text-center mt-8 p-4 bg-gray-100 rounded-lg">
        <p class="text-gray-600">
          © 2025 - Julián Manuel Cancelo & Nicolás Otero
        </p>
        <p class="text-sm text-gray-500 mt-1">
          Trabajo Final - ALED3 - Instituto Tecnológico Beltrán
        </p>
        <div class="mt-3 text-xs text-gray-400">
          <p>📍 Av. Belgrano 1191, Avellaneda – Buenos Aires – Argentina</p>
          <p>📞 (+54.11) 4265.0247 | 📧 informes&#64;ibeltran.com.ar</p>
          <p>🌐 www.ibeltran.com.ar</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .about-container {
      animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .project-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .info-item {
      border-left: 3px solid #e3f2fd;
      padding-left: 12px;
    }
    
    .author-card {
      transition: transform 0.2s ease;
    }
    
    .author-card:hover {
      transform: translateY(-2px);
    }
    
    .feature-item {
      padding: 8px 0;
    }
    
    .objective-item {
      padding: 16px 0;
    }
    
    mat-card {
      margin-bottom: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: box-shadow 0.3s ease;
    }
    
    mat-card:hover {
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
    }
  `]
})
export class AboutComponent {
  
  constructor() {
    console.log('AboutComponent initialized - Proyecto ALED3 by Julián Cancelo & Nicolás Otero');
  }
}

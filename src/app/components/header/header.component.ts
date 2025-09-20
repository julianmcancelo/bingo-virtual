import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { LevelService } from '../../services/level.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * HeaderComponent - Componente de encabezado de la aplicación
 *
 * Este componente maneja la barra de navegación superior que incluye:
 * - Logo de la aplicación con enlace a la página principal
 * - Menú de navegación principal con enlaces a las diferentes secciones
 * - Sistema de autenticación con menú de usuario
 * - Indicadores de nivel y experiencia del jugador
 * - Notificaciones y menú desplegable del usuario
 *
 * Funcionalidades principales:
 * - Navegación responsive para móviles y desktop
 * - Gestión de estado de autenticación
 * - Sistema de niveles y progreso visual
 * - Menú contextual con opciones de usuario
 * - Integración con servicios de autenticación y niveles
 *
 * @author Julián Cancelo <julian.cancelo@alumnos.fi.unlp.edu.ar>
 * @author Nicolás Otero <nicolas.otero@alumnos.fi.unlp.edu.ar>
 * @course Algoritmos y Estructuras de Datos III (ALED3)
 * @professor Sebastián Saldivar
 * @year 2025
 * @university Instituto Tecnológico Beltrán
 * @faculty Facultad de Informática
 *
 * @description
 * Este componente demuestra la implementación de:
 * - Componentes standalone de Angular 18
 * - Programación reactiva con RxJS (Observables y Subscriptions)
 * - Detección de plataforma para SSR (Server-Side Rendering)
 * - Gestión de eventos del DOM de forma segura
 * - Integración con múltiples servicios (Auth, Level, Router)
 * - Patrones de diseño: Observer, Singleton
 */

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styles: [`
    .router-link-active {
      @apply border-indigo-500 text-gray-900;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('userMenu') userMenuElement!: ElementRef;

  /**
   * Propiedades de estado del componente
   * Estas variables controlan el comportamiento visual y funcional del header
   */
  isMobileMenuOpen = false;        // Controla la visibilidad del menú móvil
  isUserMenuOpen = false;          // Controla la visibilidad del menú de usuario
  isAuthenticated = false;         // Estado de autenticación del usuario
  currentUser: User | null = null; // Datos del usuario actualmente logueado

  /**
   * Propiedades del sistema de niveles y experiencia
   * Estas muestran el progreso del jugador en el juego
   */
  userInitials = '??';             // Iniciales del usuario para mostrar en el avatar
  currentLevel: number = 1;        // Nivel actual del jugador
  currentXp: number = 0;           // Experiencia actual del jugador
  xpToNextLevel: number = 0;       // XP necesaria para el siguiente nivel
  progressPercentage: number = 0;   // Porcentaje de progreso hacia el siguiente nivel

  /**
   * Gestión de subscripciones de RxJS
   * Implementa el patrón Observer para manejar cambios en el estado de autenticación
   */
  private authSubscription: Subscription | null = null;

  /**
   * Detección de plataforma para Server-Side Rendering (SSR)
   * Evita errores de localStorage durante el renderizado en servidor
   */
  private isBrowser: boolean;

  /**
   * Constructor del componente - Implementa patrón de inyección de dependencias
   * @param authService Servicio de autenticación para gestionar sesiones de usuario
   * @param levelService Servicio de niveles para obtener datos de progreso del jugador
   * @param router Servicio de navegación para redireccionar entre rutas
   * @param platformId Identificador de plataforma para detección SSR
   */
  constructor(
    private authService: AuthService,
    private levelService: LevelService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.updateLevelInfo();
  }

  /**
   * ngOnInit - Método del ciclo de vida de Angular
   * Se ejecuta cuando el componente se inicializa
   *
   * Implementa el patrón Observer suscribiéndose a cambios de autenticación
   * Configura event listeners de forma segura solo en el navegador
   */
  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      this.updateUserInitials();
    });

    // Solo agregar el event listener en el navegador
    if (this.isBrowser) {
      document.addEventListener('click', this.onDocumentClick);
    }
  }

  /**
   * ngOnDestroy - Método del ciclo de vida de Angular
   * Se ejecuta cuando el componente se destruye
   *
   * Limpia todas las subscripciones para evitar memory leaks
   * Remueve event listeners para prevenir errores
   */
  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    // Solo remover el event listener si estamos en el navegador
    if (this.isBrowser) {
      document.removeEventListener('click', this.onDocumentClick);
    }
  }

  /**
   * toggleUserMenu - Controla la visibilidad del menú desplegable del usuario
   * @param event Evento de click que activa la función
   *
   * Implementa manejo de eventos para evitar propagación no deseada
   * Alterna el estado booleano del menú de usuario
   */
  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  /**
   * toggleMobileMenu - Controla la visibilidad del menú móvil
   *
   * Función preparada para implementar funcionalidad de menú móvil
   * cuando sea necesario en futuras versiones
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /**
   * logout - Maneja el cierre de sesión del usuario
   *
   * Implementa el patrón Command para ejecutar la lógica de logout
   * Cierra menús abiertos y redirige a la página principal
   */
  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.isMobileMenuOpen = false;
    this.router.navigate(['/']);
  }

  /**
   * onDocumentClick - Manejador de clicks fuera del menú de usuario
   * @param event Evento de mouse click
   *
   * Implementa funcionalidad de "click outside" para cerrar menús automáticamente
   * Usa arrow function para mantener el contexto 'this' correcto
   */
  private onDocumentClick = (event: MouseEvent): void => {
    // Verificar si estamos en el navegador y si el elemento del menú está definido
    if (this.isBrowser && this.userMenuElement?.nativeElement && event.target) {
      if (!this.userMenuElement.nativeElement.contains(event.target as Node)) {
        this.isUserMenuOpen = false;
      }
    }
  };

  /**
   * onClickOutside - HostListener para detectar clicks fuera del componente
   * @param event Evento de mouse click
   *
   * Decorador @HostListener que escucha eventos en el documento completo
   * Delega la lógica al método onDocumentClick
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    this.onDocumentClick(event);
  }

  /**
   * updateUserInitials - Genera las iniciales del usuario para mostrar en el avatar
   *
   * Algoritmo de generación de iniciales:
   * 1. Si no hay usuario, muestra '??'
   * 2. Toma el nombre completo del usuario
   * 3. Si tiene múltiples partes (nombre + apellido), usa las primeras letras de cada una
   * 4. Si solo tiene una parte, usa la primera letra
   * 5. Si no tiene nombre pero tiene email, usa la primera letra del email
   * 6. Convierte todo a mayúsculas
   *
   * @complexity O(n) donde n es la longitud del nombre del usuario
   */
  private updateUserInitials(): void {
    if (!this.currentUser) {
      this.userInitials = '??';
      return;
    }

    const name = this.currentUser.nombre_usuario || '';
    const parts = name.split(' ');

    if (parts.length >= 2) {
      this.userInitials = `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    } else if (name.length > 0) {
      this.userInitials = name[0].toUpperCase();
    } else if (this.currentUser.email) {
      this.userInitials = this.currentUser.email[0].toUpperCase();
    } else {
      this.userInitials = '??';
    }

    this.updateLevelInfo();
  }

  /**
   * updateLevelInfo - Actualiza la información del nivel y experiencia del jugador
   *
   * Obtiene los datos del servicio de niveles y actualiza las propiedades del componente
   * Implementa el patrón Observer para mantener la UI sincronizada con los datos
   *
   * @complexity O(1) - Operaciones directas de lectura
   */
  private updateLevelInfo(): void {
    this.currentLevel = this.levelService.getCurrentLevel();
    this.currentXp = this.levelService.getCurrentXp();
    this.xpToNextLevel = this.levelService.getXpToNextLevel();
    this.progressPercentage = this.levelService.getProgressPercentage();
  }

  /**
   * getAvatarUrl - Genera la URL completa del avatar del usuario
   * @param avatarPath Ruta relativa o URL del avatar
   * @returns URL completa del avatar o ruta por defecto
   *
   * Algoritmo de resolución de avatar:
   * 1. Si no hay ruta, usa avatar por defecto
   * 2. Si es URL completa (http/https), la devuelve tal cual
   * 3. Si comienza con /uploads/avatars/, combina con URL base de la API
   * 4. Si es solo nombre de archivo, lo busca en assets/avatars/
   * 5. Para cualquier otro caso, devuelve la ruta tal cual
   *
   * @complexity O(1) - Solo operaciones de string
   */
  getAvatarUrl(avatarPath: string | undefined | null): string {
    // Si no hay ruta de avatar, devolver el avatar por defecto
    if (!avatarPath) {
      return 'assets/avatars/default-avatar.png';
    }

    // Si ya es una URL completa, la devolvemos tal cual
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }

    // Si es una ruta que comienza con /uploads/avatars/, la combinamos con la URL base de la API
    if (avatarPath.startsWith('/uploads/avatars/')) {
      const baseUrl = environment.apiUrl || '';
      return `${baseUrl}${avatarPath}`;
    }

    // Si es solo el nombre del archivo, asumimos que está en la carpeta de avatares local
    if (!avatarPath.includes('/')) {
      return `assets/avatars/${avatarPath}`;
    }

    // Para cualquier otro caso, devolvemos la ruta tal cual
    return avatarPath;
  }

  /**
   * onImageError - Maneja errores de carga de imágenes de avatar
   * @param event Evento de error de la imagen
   *
   * Implementa manejo robusto de errores para imágenes:
   * - Cambia la imagen fallida por el avatar por defecto
   * - Solo cambia si no es ya el avatar por defecto (evita bucle infinito)
   * - Usa type assertion para acceder a propiedades de HTMLImageElement
   *
   * @complexity O(1) - Operación simple de manipulación DOM
   */
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && imgElement.src !== 'assets/avatars/default-avatar.png') {
      imgElement.src = 'assets/avatars/default-avatar.png';
    }
  }
}

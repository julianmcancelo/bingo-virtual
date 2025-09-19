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
 * Este componente muestra la barra de navegación superior con el menú de usuario,
 * notificaciones y opciones de autenticación.
 * 
 * @author Julián Cancelo <julian.cancelo@alumnos.fi.unlp.edu.ar>
 * @author Nicolás Otero <nicolas.otero@alumnos.fi.unlp.edu.ar>
 * @course Algoritmos y Estructuras de Datos III (ALED3)
 * @professor Sebastián Saldivar
 * @year 2024
 * @university Universidad Nacional de La Plata (UNLP)
 * @faculty Facultad de Informática
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
  
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  isAuthenticated = false;
  currentUser: User | null = null;
  userInitials = '??';
  currentLevel: number = 1;
  currentXp: number = 0;
  xpToNextLevel: number = 0;
  progressPercentage: number = 0;
  
  private authSubscription: Subscription | null = null;
  
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private levelService: LevelService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.updateLevelInfo();
  }

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
  
  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    // Solo remover el event listener si estamos en el navegador
    if (this.isBrowser) {
      document.removeEventListener('click', this.onDocumentClick);
    }
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.isMobileMenuOpen = false;
    this.router.navigate(['/']);
  }

  private onDocumentClick = (event: MouseEvent): void => {
    // Verificar si estamos en el navegador y si el elemento del menú está definido
    if (this.isBrowser && this.userMenuElement?.nativeElement && event.target) {
      if (!this.userMenuElement.nativeElement.contains(event.target as Node)) {
        this.isUserMenuOpen = false;
      }
    }
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    this.onDocumentClick(event);
  }

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
  
  private updateLevelInfo(): void {
    this.currentLevel = this.levelService.getCurrentLevel();
    this.currentXp = this.levelService.getCurrentXp();
    this.xpToNextLevel = this.levelService.getXpToNextLevel();
    this.progressPercentage = this.levelService.getProgressPercentage();
  }

  /**
   * Obtiene la URL completa del avatar del usuario
   * @param avatarPath Ruta relativa del avatar
   * @returns URL completa del avatar o ruta al avatar por defecto
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
   * Maneja el error de carga de la imagen del avatar
   * @param event Evento de error de la imagen
   */
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && imgElement.src !== 'assets/avatars/default-avatar.png') {
      imgElement.src = 'assets/avatars/default-avatar.png';
    }
  }
}

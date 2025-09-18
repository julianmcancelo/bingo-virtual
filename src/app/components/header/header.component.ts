import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <a [routerLink]="['/']" class="text-indigo-600 font-bold text-xl">
                Bingo Virtual
              </a>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a [routerLink]="['/bingo']" class="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Jugar
              </a>
              <a *ngIf="isAuthenticated" [routerLink]="['/estadisticas']" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Estadísticas
              </a>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <ng-container *ngIf="isAuthenticated; else notAuthenticated">
              <div class="ml-3 relative">
                <div>
                  <button type="button" class="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" id="user-menu" aria-expanded="false" aria-haspopup="true" (click)="toggleUserMenu()">
                    <span class="sr-only">Abrir menú de usuario</span>
                    <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                      {{ userInitials }}
                    </div>
                  </button>
                </div>
                <div *ngIf="isUserMenuOpen" class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                  <a [routerLink]="['/perfil']" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Tu perfil</a>
                  <a (click)="logout()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" role="menuitem">Cerrar sesión</a>
                </div>
              </div>
            </ng-container>
            <ng-template #notAuthenticated>
              <div class="flex space-x-4">
                <!-- Navegar a /bingo con query param para abrir el panel de login inline -->
                <a [routerLink]="['/bingo']" [queryParams]="{ mode: 'signin' }" class="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Iniciar sesión
                </a>
                <!-- Navegar a /bingo con query param para abrir el panel de registro inline -->
                <a [routerLink]="['/bingo']" [queryParams]="{ mode: 'register' }" class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                  Registrarse
                </a>
              </div>
            </ng-template>
          </div>
          <div class="-mr-2 flex items-center sm:hidden">
            <button type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-controls="mobile-menu" aria-expanded="false" (click)="toggleMobileMenu()">
              <span class="sr-only">Abrir menú principal</span>
              <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <!-- Mobile menu, show/hide based on menu state. -->
      <div *ngIf="isMobileMenuOpen" class="sm:hidden" id="mobile-menu">
        <div class="pt-2 pb-3 space-y-1">
          <a [routerLink]="['/bingo']" class="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Jugar</a>
          <a *ngIf="isAuthenticated" [routerLink]="['/estadisticas']" class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Estadísticas</a>
        </div>
        <div *ngIf="isAuthenticated; else mobileNotAuthenticated" class="pt-4 pb-3 border-t border-gray-200">
          <div class="flex items-center px-4">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                {{ userInitials }}
              </div>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800">{{ currentUser?.nombre_usuario || currentUser?.email }}</div>
              <div class="text-sm font-medium text-gray-500">{{ currentUser?.email }}</div>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <a [routerLink]="['/perfil']" class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Tu perfil</a>
            <a (click)="logout()" class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer">Cerrar sesión</a>
          </div>
        </div>
        <ng-template #mobileNotAuthenticated>
          <div class="pt-4 pb-3 border-t border-gray-200">
            <div class="space-y-1">
              <!-- Mobile: ir a /bingo con modo login -->
              <a [routerLink]="['/bingo']" [queryParams]="{ mode: 'signin' }" class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Iniciar sesión
              </a>
              <!-- Mobile: ir a /bingo con modo registro -->
              <a [routerLink]="['/bingo']" [queryParams]="{ mode: 'register' }" class="block px-4 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50">
                Registrarse
              </a>
            </div>
          </div>
        </ng-template>
      </div>
    </header>
  `,
  styles: [`
    .router-link-active {
      @apply border-indigo-500 text-gray-900;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isUserMenuOpen = false;
  isMobileMenuOpen = false;
  currentUser: any = null;
  userInitials = '??';

  private authSubscription: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUser = user;
      this.updateUserInitials();
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.isMobileMenuOpen = false;
  }

  private updateUserInitials() {
    if (this.currentUser?.nombre_usuario) {
      const names = this.currentUser.nombre_usuario.split(' ');
      this.userInitials = names
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    } else if (this.currentUser?.email) {
      this.userInitials = this.currentUser.email.substring(0, 2).toUpperCase();
    } else {
      this.userInitials = '??';
    }
  }
}

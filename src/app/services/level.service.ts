import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Configuración de niveles
 */
interface LevelConfig {
  level: number;       // Nivel actual
  xpRequired: number;  // Experiencia necesaria para alcanzar este nivel
  xpMultiplier: number; // Multiplicador de experiencia para el siguiente nivel
}

/**
 * Servicio para manejar el sistema de niveles y experiencia del usuario
 * 
 * Este servicio se encarga de:
 * - Gestionar la experiencia del usuario (XP)
 * - Controlar la progresión de niveles
 * - Almacenar el progreso en el localStorage
 * - Proporcionar métodos para otorgar XP por diferentes acciones
 * 
 * @author Julián Cancelo <julian.cancelo@alumnos.fi.unlp.edu.ar>
 * @author Nicolás Otero <nicolas.otero@alumnos.fi.unlp.edu.ar>
 * @course Algoritmos y Estructuras de Datos III (ALED3)
 * @professor Sebastián Saldivar
 * @year 2025
 * @institution Instituto Beltran
 */
@Injectable({
  providedIn: 'root' // Proporcionado a nivel de raíz para ser un singleton
})
export class LevelService {
  // Constantes de configuración
  private readonly XP_BASE = 100;    // XP base necesaria para el nivel 1
  private readonly XP_FACTOR = 1.5;  // Factor de crecimiento exponencial entre niveles
  private readonly MAX_LEVEL = 100;  // Nivel máximo alcanzable
  
  // Estado actual del jugador
  private currentLevel: number = 1;  // Nivel actual del jugador
  private currentXp: number = 0;     // XP actual dentro del nivel actual
  private xpToNextLevel: number;     // XP necesaria para el siguiente nivel
  private isBrowser: boolean;        // Flag para verificar si estamos en el navegador
  
  /**
   * Constructor del servicio
   * @param platformId Identificador de la plataforma (browser/server)
   */
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.xpToNextLevel = this.calculateXpForLevel(1);
    this.loadProgress();
  }

  /**
   * Carga el progreso guardado del localStorage
   */
  private loadProgress(): void {
    if (this.isBrowser) {
      try {
        const savedData = localStorage.getItem('userLevelData');
        if (savedData) {
          const { level, xp } = JSON.parse(savedData);
          // Validar los datos cargados
          if (level > 0 && level <= this.MAX_LEVEL && xp >= 0) {
            this.currentLevel = level;
            this.currentXp = xp;
            this.xpToNextLevel = this.calculateXpForLevel(this.currentLevel);
          }
        }
      } catch (error) {
        console.error('Error al cargar el progreso de niveles:', error);
        // Restablecer a valores por defecto en caso de error
        this.resetProgress();
      }
    }
  }

  /**
   * Guarda el progreso actual en el localStorage
   */
  private saveProgress(): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem('userLevelData', JSON.stringify({
          level: this.currentLevel,
          xp: this.currentXp,
          lastUpdated: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error al guardar el progreso de niveles:', error);
      }
    }
  }

  /**
   * Añade experiencia al jugador
   * @param amount Cantidad de experiencia a añadir
   * @returns Objeto con el nivel actual, experiencia y si se subió de nivel
   */
  addXp(amount: number): { level: number; xp: number; leveledUp: boolean } {
    // No hacer nada si ya se alcanzó el nivel máximo
    if (this.currentLevel >= this.MAX_LEVEL) {
      return { 
        level: this.currentLevel, 
        xp: this.currentXp, 
        leveledUp: false 
      };
    }

    let leveledUp = false;
    this.currentXp += Math.max(0, amount); // Asegurar que no sea negativo

    // Verificar si el jugador subió de nivel (puede subir varios niveles a la vez)
    while (this.currentXp >= this.xpToNextLevel && this.currentLevel < this.MAX_LEVEL) {
      this.currentXp -= this.xpToNextLevel;
      this.currentLevel++;
      this.xpToNextLevel = this.calculateXpForLevel(this.currentLevel);
      leveledUp = true;
      
      // Si alcanzamos el nivel máximo, ajustamos la experiencia
      if (this.currentLevel === this.MAX_LEVEL) {
        this.currentXp = 0;
        break;
      }
    }

    this.saveProgress();
    return { 
      level: this.currentLevel, 
      xp: this.currentXp, 
      leveledUp 
    };
  }

  /**
   * Obtiene el nivel actual del jugador
   */
  getCurrentLevel(): number {
    return this.currentLevel;
  }

  /**
   * Obtiene la experiencia actual dentro del nivel actual
   */
  getCurrentXp(): number {
    return this.currentXp;
  }

  /**
   * Obtiene la experiencia necesaria para el siguiente nivel
   */
  getXpToNextLevel(): number {
    return this.xpToNextLevel;
  }

  /**
   * Calcula el porcentaje de progreso hacia el siguiente nivel
   * @returns Porcentaje de 0 a 100
   */
  getProgressPercentage(): number {
    // Si es el nivel máximo, siempre mostrar 100%
    if (this.currentLevel >= this.MAX_LEVEL) {
      return 100;
    }
    return Math.min(100, (this.currentXp / this.xpToNextLevel) * 100);
  }
  
  /**
   * Obtiene la experiencia total acumulada por el jugador
   */
  getTotalXp(): number {
    let totalXp = this.currentXp;
    
    // Sumar la experiencia de todos los niveles anteriores
    for (let level = 1; level < this.currentLevel; level++) {
      totalXp += this.calculateXpForLevel(level);
    }
    
    return totalXp;
  }

  /**
   * Calcula la experiencia necesaria para un nivel específico
   * @param level Nivel para el cual calcular la experiencia necesaria
   * @returns Cantidad de experiencia necesaria para alcanzar ese nivel
   */
  private calculateXpForLevel(level: number): number {
    // Fórmula exponencial: XP = XP_BASE * (XP_FACTOR ^ (nivel - 1))
    return Math.floor(this.XP_BASE * Math.pow(this.XP_FACTOR, level - 1));
  }

  // =============================================
  // MÉTODOS PARA GANAR XP POR ACCIONES ESPECÍFICAS
  // =============================================
  
  /**
   * Otorga XP por ganar una partida
   */
  addXpForGameWin(): void {
    this.addXp(50); // 50 XP por victoria
  }

  /**
   * Otorga XP por participar en una partida
   */
  addXpForGameParticipation(): void {
    this.addXp(10); // 10 XP por participación
  }

  /**
   * Otorga XP por hacer bingo
   */
  addXpForBingo(): void {
    this.addXp(20); // 20 XP por cada bingo
  }
  
  /**
   * Otorga XP por invitar a un amigo
   */
  addXpForFriendInvite(): void {
    this.addXp(15); // 15 XP por invitar a un amigo
  }
  
  /**
   * Otorga XP por completar el perfil
   */
  addXpForProfileCompletion(): void {
    this.addXp(30); // 30 XP por completar el perfil
  }

  // =============================================
  // MÉTODOS DE UTILIDAD
  // =============================================
  
  /**
   * Reinicia el progreso del jugador (solo para pruebas)
   */
  resetProgress(): void {
    this.currentLevel = 1;
    this.currentXp = 0;
    this.xpToNextLevel = this.calculateXpForLevel(1);
    this.saveProgress();
  }
  
  /**
   * Obtiene información detallada sobre el progreso actual
   */
  getProgressInfo() {
    return {
      level: this.currentLevel,
      currentXp: this.currentXp,
      xpToNextLevel: this.xpToNextLevel,
      progressPercentage: this.getProgressPercentage(),
      totalXp: this.getTotalXp(),
      isMaxLevel: this.currentLevel >= this.MAX_LEVEL,
      xpForNextLevel: this.currentLevel < this.MAX_LEVEL ? 
        this.calculateXpForLevel(this.currentLevel + 1) : 0
    };
  }
}

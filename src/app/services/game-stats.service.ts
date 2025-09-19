import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import { environment } from '../../environments/environment';
import { GameStats, PlayerStats, GameLog, PlayerAggregatedStats, GlobalGameStats } from '../models/game-stats.model';
import { LevelService } from './level.service';

/**
 * Servicio para gestionar las estadísticas de juego
 * @author Julián Cancelo <julian.cancelo@alumnos.fi.unlp.edu.ar>
 * @author Nicolás Otero <nicolas.otero@alumnos.fi.unlp.edu.ar>
 * @course Algoritmos y Estructuras de Datos III (ALED3)
 * @professor Sebastián Saldivar
 * @year 2024
 * @institution Instituto Beltran
 */
@Injectable({
  providedIn: 'root'
})
export class GameStatsService {
  private apiUrl = environment.apiUrl;
  private isBrowser: boolean;
  private readonly STATS_KEY = 'game_stats';
  private statsSubject = new BehaviorSubject<GameStats[]>([]);
  
  // Configuración de XP por acción
  private readonly XP_VALUES = {
    GAME_WIN: 100,
    GAME_LOSS: 25,
    BINGO: 50,
    DOUBLE_LINE: 30,
    LINE: 15,
    FOUR_CORNERS: 20,
    PER_NUMBER: 1,
    GAME_COMPLETION: 10
  };

  constructor(
    private http: HttpClient,
    private levelService: LevelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadInitialData();
  }

  /**
   * Carga los datos iniciales desde el localStorage
   */
  private loadInitialData(): void {
    if (this.isBrowser) {
      try {
        const savedStats = localStorage.getItem(this.STATS_KEY);
        if (savedStats) {
          const parsed = JSON.parse(savedStats);
          // Convertir las cadenas de fecha a objetos Date
          const statsWithDates = parsed.map((game: any) => ({
            ...game,
            startTime: new Date(game.startTime),
            endTime: game.endTime ? new Date(game.endTime) : undefined,
            createdAt: new Date(game.createdAt),
            updatedAt: new Date(game.updatedAt),
            players: game.players.map((player: any) => ({
              ...player,
              lastActive: player.lastActive ? new Date(player.lastActive) : undefined
            })),
            logs: game.logs.map((log: any) => ({
              ...log,
              timestamp: new Date(log.timestamp)
            }))
          }));
          this.statsSubject.next(statsWithDates);
        }
      } catch (e) {
        console.error('Error al cargar las estadísticas guardadas', e);
      }
    }
  }

  /**
   * Guarda las estadísticas en el localStorage
   */
  private saveToLocalStorage(stats: GameStats[]): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
      } catch (e) {
        console.error('Error al guardar las estadísticas', e);
      }
    }
  }

  /**
   * Registra una nueva partida
   */
  recordGame(stats: Omit<GameStats, 'id' | 'createdAt' | 'updatedAt' | 'logs'>): Observable<GameStats> {
    const gameStats: GameStats = {
      ...stats,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      logs: []
    };

    // Calcular XP para cada jugador
    gameStats.players = this.calculatePlayersXp(gameStats);

    if (environment.production) {
      return this.http.post<GameStats>(`${this.apiUrl}/games/stats`, gameStats).pipe(
        tap(savedGame => {
          const currentStats = this.statsSubject.value;
          this.statsSubject.next([...currentStats, savedGame]);
        })
      );
    } else {
      const currentStats = this.statsSubject.value;
      const updatedStats = [...currentStats, gameStats];
      this.statsSubject.next(updatedStats);
      this.saveToLocalStorage(updatedStats);
      
      // Otorgar XP a los jugadores
      this.grantXpForGame(gameStats);
      
      return of(gameStats);
    }
  }

  /**
   * Calcula la XP para cada jugador basado en sus logros
   */
  private calculatePlayersXp(gameStats: GameStats): PlayerStats[] {
    return gameStats.players.map(player => {
      let xpEarned = 0;
      
      // XP por ganar la partida
      if (player.isWinner) {
        xpEarned += this.XP_VALUES.GAME_WIN;
      } else {
        xpEarned += this.XP_VALUES.GAME_LOSS;
      }
      
      // XP por logros
      if (player.bingoPatterns.bingo) xpEarned += this.XP_VALUES.BINGO;
      if (player.bingoPatterns.doubleLine) xpEarned += this.XP_VALUES.DOUBLE_LINE;
      if (player.bingoPatterns.line) xpEarned += this.XP_VALUES.LINE;
      if (player.bingoPatterns.fourCorners) xpEarned += this.XP_VALUES.FOUR_CORNERS;
      
      // XP por números marcados (con límite)
      const numbersXp = Math.min(
        player.markedNumbers.length * this.XP_VALUES.PER_NUMBER,
        30 // Límite de XP por números
      );
      xpEarned += numbersXp;
      
      // XP por completar la partida
      xpEarned += this.XP_VALUES.GAME_COMPLETION;
      
      return {
        ...player,
        xpEarned: Math.round(xpEarned)
      };
    });
  }

  /**
   * Otorga XP a los jugadores según sus logros
   */
  private grantXpForGame(gameStats: GameStats): void {
    gameStats.players.forEach(player => {
      if (player.xpEarned > 0) {
        this.levelService.addXp(player.xpEarned);
      }
    });
  }

  /**
   * Obtiene todas las partidas
   */
  getAllGames(): Observable<GameStats[]> {
    if (environment.production) {
      return this.http.get<GameStats[]>(`${this.apiUrl}/games/stats`).pipe(
        map(games => games.map(game => this.parseGameStats(game)))
      );
    } else {
      return this.statsSubject.asObservable().pipe(
        map(games => games.map(game => this.parseGameStats(game)))
      );
    }
  }

  /**
   * Convierte las fechas de string a objetos Date
   */
  private parseGameStats(game: any): GameStats {
    return {
      ...game,
      startTime: new Date(game.startTime),
      endTime: game.endTime ? new Date(game.endTime) : undefined,
      createdAt: new Date(game.createdAt),
      updatedAt: new Date(game.updatedAt),
      players: game.players ? game.players.map((player: any) => ({
        ...player,
        // Asegurar que cualquier fecha en los jugadores también sea convertida
      })) : [],
      logs: game.logs ? game.logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      })) : []
    };
  }

  /**
   * Obtiene las estadísticas de un jugador
   */
  getPlayerStats(userId: string): Observable<PlayerAggregatedStats> {
    if (environment.production) {
      return this.http.get<PlayerAggregatedStats>(`${this.apiUrl}/players/${userId}/stats`).pipe(
        map(stats => ({
          ...stats,
          lastPlayed: new Date(stats.lastPlayed)
        }))
      );
    } else {
      return this.statsSubject.pipe(
        map(games => this.calculatePlayerStats(userId, games.map(game => this.parseGameStats(game))))
      );
    }
  }

  /**
   * Calcula las estadísticas agregadas de un jugador
   */
  private calculatePlayerStats(userId: string, games: GameStats[]): PlayerAggregatedStats {
    const playerGames = games.filter(game => 
      game.players.some(p => p.userId === userId)
    );

    if (playerGames.length === 0) {
      return this.getEmptyPlayerStats(userId);
    }

    const playerStats = playerGames.flatMap(game => 
      game.players.filter(p => p.userId === userId)
    );

    const totalGames = playerGames.length;
    const gamesWon = playerStats.filter(p => p.isWinner).length;
    const totalBingos = playerStats.filter(p => p.bingoPatterns.bingo).length;
    const totalLines = playerStats.filter(p => p.bingoPatterns.line).length;
    const totalDoubleLines = playerStats.filter(p => p.bingoPatterns.doubleLine).length;
    const totalFourCorners = playerStats.filter(p => p.bingoPatterns.fourCorners).length;
    const totalXp = playerStats.reduce((sum, p) => sum + (p.xpEarned || 0), 0);
    
    const gameDurations = playerGames
      .filter(g => g.duration)
      .map(g => g.duration as number);
    
    const averageGameDuration = gameDurations.length > 0
      ? Math.round(gameDurations.reduce((a, b) => a + b, 0) / gameDurations.length)
      : 0;

    const lastPlayed = playerGames.length > 0
      ? new Date(Math.max(...playerGames.map(g => g.endTime?.getTime() || g.startTime.getTime())))
      : new Date();

    // Obtener logros (simplificado)
    const achievements = [];
    if (totalGames >= 1) achievements.push('Primera partida');
    if (totalGames >= 10) achievements.push('Jugador experimentado');
    if (gamesWon >= 1) achievements.push('Primera victoria');
    if (gamesWon >= 10) achievements.push('Veterano');
    if (totalBingos >= 1) achievements.push('¡Bingo!');
    if (totalBingos >= 10) achievements.push('Maestro del Bingo');

    return {
      userId,
      username: playerStats[0]?.username || 'Jugador',
      totalGames,
      gamesWon,
      totalBingos,
      totalLines,
      totalDoubleLines,
      totalFourCorners,
      totalXp,
      averageGameDuration,
      winRate: totalGames > 0 ? (gamesWon / totalGames) * 100 : 0,
      lastPlayed,
      achievements
    };
  }

  /**
   * Retorna estadísticas vacías para un jugador
   */
  private getEmptyPlayerStats(userId: string): PlayerAggregatedStats {
    return {
      userId,
      username: 'Jugador',
      totalGames: 0,
      gamesWon: 0,
      totalBingos: 0,
      totalLines: 0,
      totalDoubleLines: 0,
      totalFourCorners: 0,
      totalXp: 0,
      averageGameDuration: 0,
      winRate: 0,
      lastPlayed: new Date(),
      achievements: []
    };
  }

  /**
   * Obtiene las estadísticas globales del juego
   */
  getGlobalStats(): Observable<GlobalGameStats> {
    if (environment.production) {
      return this.http.get<GlobalGameStats>(`${this.apiUrl}/games/global-stats`);
    } else {
      return this.statsSubject.pipe(
        map(games => this.calculateGlobalStats(games))
      );
    }
  }

  /**
   * Calcula las estadísticas globales del juego
   */
  private calculateGlobalStats(games: GameStats[]): GlobalGameStats {
    if (games.length === 0) {
      return {
        totalGamesPlayed: 0,
        totalPlayers: 0,
        averagePlayersPerGame: 0,
        averageGameDuration: 0,
        mostCommonNumber: 0,
        leastCommonNumber: 0,
        totalBingos: 0,
        totalLines: 0,
        totalDoubleLines: 0,
        mostActivePlayer: {
          userId: '',
          username: 'Ninguno',
          gamesPlayed: 0
        },
        lastGames: []
      };
    }

    // Contar jugadores únicos
    const playerCounts = new Map<string, { userId: string; username: string; count: number }>();
    const numberCounts = new Map<number, number>();
    let totalBingos = 0;
    let totalLines = 0;
    let totalDoubleLines = 0;
    let totalGameDuration = 0;
    let totalPlayersInGames = 0;

    // Procesar cada partida
    games.forEach(game => {
      // Contar jugadores por partida
      totalPlayersInGames += game.players.length;
      
      // Actualizar recuento de partidas por jugador
      game.players.forEach(player => {
        const existing = playerCounts.get(player.userId) || { 
          userId: player.userId, 
          username: player.username, 
          count: 0 
        };
        existing.count++;
        playerCounts.set(player.userId, existing);
      });

      // Contar patrones de victoria
      game.players.forEach(player => {
        if (player.bingoPatterns.bingo) totalBingos++;
        if (player.bingoPatterns.line) totalLines++;
        if (player.bingoPatterns.doubleLine) totalDoubleLines++;
      });

      // Contar números sorteados
      game.numbersDrawn.forEach(num => {
        numberCounts.set(num, (numberCounts.get(num) || 0) + 1);
      });

      // Sumar duración de la partida
      if (game.duration) {
        totalGameDuration += game.duration;
      }
    });

    // Encontrar el jugador más activo
    let mostActivePlayer = { userId: '', username: 'Ninguno', gamesPlayed: 0 };
    playerCounts.forEach((value, key) => {
      if (value.count > mostActivePlayer.gamesPlayed) {
        mostActivePlayer = {
          userId: value.userId,
          username: value.username,
          gamesPlayed: value.count
        };
      }
    });

    // Encontrar el número más y menos común
    let mostCommonNumber = 0;
    let leastCommonNumber = 0;
    let maxCount = 0;
    let minCount = Infinity;
    
    numberCounts.forEach((count, num) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonNumber = num;
      }
      if (count < minCount) {
        minCount = count;
        leastCommonNumber = num;
      }
    });

    // Obtener las últimas partidas
    const lastGames = games
      .map(game => ({
        ...game,
        startTime: new Date(game.startTime),
        endTime: game.endTime ? new Date(game.endTime) : undefined,
        createdAt: new Date(game.createdAt),
        updatedAt: new Date(game.updatedAt),
        players: game.players.map(player => ({
          ...player,
          // Asegurarse de que los campos de fecha en los jugadores también sean Date
          // si existen
        }))
      }))
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 5)
      .map(game => ({
        id: game.id,
        date: game.endTime || game.startTime,
        winner: game.winners.length > 0 ? game.players.find(p => p.userId === game.winners[0])?.username || 'Desconocido' : 'Ninguno',
        totalPlayers: game.players.length
      }));

    return {
      totalGamesPlayed: games.length,
      totalPlayers: playerCounts.size,
      averagePlayersPerGame: totalPlayersInGames / games.length,
      averageGameDuration: Math.round(totalGameDuration / games.length),
      mostCommonNumber,
      leastCommonNumber,
      totalBingos,
      totalLines,
      totalDoubleLines,
      mostActivePlayer,
      lastGames
    };
  }

  /**
   * Registra un evento en el log de la partida
   */
  logEvent(gameId: string, type: GameLog['type'], message: string, data?: any): Observable<GameLog> {
    const log: GameLog = {
      timestamp: new Date(),
      type,
      message,
      data
    };

    if (environment.production) {
      return this.http.post<GameLog>(`${this.apiUrl}/games/${gameId}/logs`, log);
    } else {
      const games = this.statsSubject.value;
      const gameIndex = games.findIndex(g => g.id === gameId);
      
      if (gameIndex !== -1) {
        const updatedGames = [...games];
        updatedGames[gameIndex] = {
          ...updatedGames[gameIndex],
          logs: [...(updatedGames[gameIndex].logs || []), log],
          updatedAt: new Date()
        };
        this.statsSubject.next(updatedGames);
        this.saveToLocalStorage(updatedGames);
      }
      
      return of(log);
    }
  }

  /**
   * Obtiene los logs de una partida
   */
  getGameLogs(gameId: string): Observable<GameLog[]> {
    if (environment.production) {
      return this.http.get<GameLog[]>(`${this.apiUrl}/games/${gameId}/logs`);
    } else {
      const game = this.statsSubject.value.find(g => g.id === gameId);
      return of(game?.logs || []);
    }
  }
}

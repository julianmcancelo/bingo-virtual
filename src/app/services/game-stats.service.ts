import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import { environment } from '../../environments/environment';
import { GameStats, PlayerStats, GameLog, PlayerAggregatedStats, GlobalGameStats } from '../models/game-stats.model';
import { LevelService } from './level.service';
import { AuthService } from './auth.service';

// Interfaz para los datos de estadísticas en tiempo real
interface RealTimeStats {
  onlinePlayers: number;
  activeGames: number;
  numbersCalled: { number: number; timestamp: Date }[];
  recentWinners: { playerId: string; playerName: string; avatar: string; prize: number }[];
}

/**
 * Servicio para gestionar las estadísticas de juego
 * @author Julián Cancelo <julian.cancelo@alumnos.fi.unlp.edu.ar>
 * @author Nicolás Otero <nicolas.otero@alumnos.fi.unlp.edu.ar>
 * @course Algoritmos y Estructuras de Datos III (ALED3)
 * @professor Sebastián Saldivar
 * @year 2025
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

  // Datos de ejemplo para generación de estadísticas
  private playerNames = ['Julián', 'Nicolás', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofía', 'Diego'];
  private avatars = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5', 'avatar6'];
  private gameModes = ['clasico', 'cuatro-esquinas', 'linea', 'doble-linea', 'patron'];
  
  // Estadísticas en tiempo real
  private realTimeStats: RealTimeStats = {
    onlinePlayers: 0,
    activeGames: 0,
    numbersCalled: [],
    recentWinners: []
  };
  private realTimeStatsSubject = new BehaviorSubject<RealTimeStats>(this.realTimeStats);

  constructor(
    private http: HttpClient,
    private levelService: LevelService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadInitialData();
    this.initializeRealTimeData();
  }

  /**
   * Inicializa datos en tiempo real
   */
  private initializeRealTimeData() {
    // Simular jugadores en línea (entre 50 y 200)
    this.realTimeStats.onlinePlayers = Math.floor(Math.random() * 150) + 50;
    
    // Simular partidas activas (entre 10 y 50)
    this.realTimeStats.activeGames = Math.floor(Math.random() * 40) + 10;
    
    // Generar números recientemente llamados
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const timeOffset = (10 - i) * 2000; // Últimos 20 segundos
      this.realTimeStats.numbersCalled.push({
        number: Math.floor(Math.random() * 75) + 1,
        timestamp: new Date(now.getTime() - timeOffset)
      });
    }
    
    // Generar ganadores recientes
    for (let i = 0; i < 5; i++) {
      const playerId = `user_${Math.floor(Math.random() * 1000)}`;
      const playerName = this.playerNames[Math.floor(Math.random() * this.playerNames.length)];
      const avatar = this.avatars[Math.floor(Math.random() * this.avatars.length)];
      
      this.realTimeStats.recentWinners.push({
        playerId,
        playerName,
        avatar,
        prize: Math.floor(Math.random() * 1000) + 100 // Premio entre 100 y 1100
      });
    }
    
    // Actualizar datos en tiempo real cada 10 segundos
    setInterval(() => this.updateRealTimeData(), 10000);
  }
  
  /**
   * Actualiza los datos en tiempo real
   */
  private updateRealTimeData() {
    // Actualizar contadores con pequeñas variaciones
    this.realTimeStats.onlinePlayers += Math.floor(Math.random() * 5) - 2; // +/- 2 jugadores
    this.realTimeStats.activeGames += Math.floor(Math.random() * 3) - 1; // +/- 1 partida
    
    // Mantener valores dentro de rangos razonables
    this.realTimeStats.onlinePlayers = Math.max(10, Math.min(500, this.realTimeStats.onlinePlayers));
    this.realTimeStats.activeGames = Math.max(1, Math.min(100, this.realTimeStats.activeGames));
    
    // Añadir nuevo número llamado
    const now = new Date();
    this.realTimeStats.numbersCalled.unshift({
      number: Math.floor(Math.random() * 75) + 1,
      timestamp: now
    });
    
    // Mantener solo los 10 números más recientes
    if (this.realTimeStats.numbersCalled.length > 10) {
      this.realTimeStats.numbersCalled.pop();
    }
    
    // Ocasionalmente añadir un nuevo ganador (20% de probabilidad)
    if (Math.random() < 0.2) {
      const playerId = `user_${Math.floor(Math.random() * 1000)}`;
      const playerName = this.playerNames[Math.floor(Math.random() * this.playerNames.length)];
      const avatar = this.avatars[Math.floor(Math.random() * this.avatars.length)];
      
      this.realTimeStats.recentWinners.unshift({
        playerId,
        playerName,
        avatar,
        prize: Math.floor(Math.random() * 1000) + 100
      });
      
      // Mantener solo los 5 ganadores más recientes
      if (this.realTimeStats.recentWinners.length > 5) {
        this.realTimeStats.recentWinners.pop();
      }
    }
    
    // Notificar a los suscriptores
    this.realTimeStatsSubject.next({...this.realTimeStats});
  }
  
  /**
   * Obtiene estadísticas en tiempo real
   */
  getRealTimeStats(): Observable<RealTimeStats> {
    return this.realTimeStatsSubject.asObservable();
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
    
    const isWin = Math.random() > 0.7; // 30% de victorias
    const gameMode = this.gameModes[Math.floor(Math.random() * this.gameModes.length)];
    
    return {
      gameId: `game_${Date.now()}_${i}`,
      date: gameDate.toISOString(),
      gameMode,
      duration: Math.floor(Math.random() * 10) + 3, // 3-12 minutos
      numbersCalled: Math.floor(Math.random() * 50) + 25, // 25-75 números
      result: isWin ? 'victory' : 'defeat',
      score: isWin ? Math.floor(Math.random() * 500) + 500 : Math.floor(Math.random() * 400),
      position: isWin ? 1 : Math.floor(Math.random() * 20) + 2,
      totalPlayers: Math.floor(Math.random() * 30) + 10, // 10-40 jugadores
      prize: isWin ? Math.floor(Math.random() * 1000) + 100 : 0
    };
  });
  
  // Generar logros
  const achievements = [
    { id: 'first_win', name: 'Primera Victoria', earned: true, date: '2025-08-15', icon: 'emoji_events' },
    { id: 'play_10_games', name: 'Jugador Activo', earned: true, date: '2025-08-20', icon: 'sports_esports' },
    { id: 'win_5_games', name: 'Ganador Nato', earned: true, date: '2025-08-25', icon: 'military_tech' },
    { id: 'play_all_modes', name: 'Experto en Variantes', earned: false, progress: 3, total: 5, icon: 'auto_awesome' },
    { id: 'level_10', name: 'Nivel 10 Alcanzado', earned: false, progress: 7, total: 10, icon: 'star' },
    { id: 'invite_friends', name: 'Amigable', earned: false, progress: 0, total: 3, icon: 'group_add' }
  ];
  
  // Crear estadísticas mejoradas del jugador
  const enhancedStats: PlayerAggregatedStats = {
    ...aggregated,
    playerName: currentUser?.username || 'Jugador Anónimo',
    avatar: currentUser?.avatar || 'default-avatar',
    level: this.levelService.getLevel(aggregated.totalXp).level,
    xp: aggregated.totalXp,
    xpToNextLevel: this.levelService.getXpToNextLevel(aggregated.totalXp),
    joinDate: '2025-08-10',
    lastPlayed: new Date().toISOString(),
    favoriteGameMode: this.gameModes[Math.floor(Math.random() * this.gameModes.length)],
    hourlyPerformance,
    weeklyPerformance,
    recentGames,
    achievements,
    badges: [
      { id: 'early_adopter', name: 'Usuario Temprano', icon: 'verified_user' },
      { id: 'loyal_player', name: 'Jugador Leal', icon: 'loyalty' }
    ],
    friendCount: Math.floor(Math.random() * 50) + 5,
    tournamentsWon: Math.floor(Math.random() * 3),
    tournamentsPlayed: Math.floor(Math.random() * 10) + 1,
    averagePosition: 5.5 + (Math.random() * 10),
    bestPosition: 1,
    winStreak: Math.floor(Math.random() * 5),
    bestWinStreak: Math.floor(Math.random() * 10) + 1,
    totalPlayTime: Math.floor(Math.random() * 100) + 20, // horas
    averageGameTime: 8.5,
    favoriteTimeToPlay: '20:00 - 22:00',
    completionRate: 0.85,
    rank: `#${Math.floor(Math.random() * 1000) + 1}`,
    percentile: Math.floor(Math.random() * 10) + 90, // Entre 90 y 99 percentil
    nextRank: 'Maestro del Bingo',
    xpToNextRank: 2500,
    totalPrizes: Math.floor(Math.random() * 5000) + 1000,
    largestPrize: Math.floor(Math.random() * 1000) + 500
  };
  
  return of(enhancedStats);
      return this.statsSubject.pipe(
        map(games => this.calculateGlobalStats(games.map(game => this.parseGameStats(game))))
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
      return this.http.get<GameLog[]>(`${this.apiUrl}/games/${gameId}/logs`).pipe(
        map(logs => logs.map(log => ({
          ...log,
          timestamp: new Date(log.timestamp)
        })))
      );
    } else {
      const game = this.statsSubject.value.find(g => g.id === gameId);
      return of((game?.logs || []).map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      })));
    }
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription, timer } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { GameStats, GlobalGameStats, PlayerAggregatedStats } from '../models/game-stats.model';
import { AuthService } from './auth.service';
import { LevelService } from './level.service';

/**
 * Servicio para generar estadísticas realistas para el dashboard
 * @author Julián Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 */
@Injectable({
  providedIn: 'root'
})
export class RealStatsService implements OnDestroy {
  // Datos de ejemplo
  private playerNames = ['Julián', 'Nicolás', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofía', 'Diego'];
  private avatars = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5', 'avatar6'];
  private gameModes = ['clasico', 'cuatro-esquinas', 'linea', 'doble-linea', 'patron'];
  
  // Estado en tiempo real
  private realTimeStats = new BehaviorSubject<{
    onlinePlayers: number;
    activeGames: number;
    numbersCalled: { number: number; timestamp: Date }[];
    recentWinners: { playerId: string; playerName: string; avatar: string; prize: number }[];
  }>({
    onlinePlayers: 0,
    activeGames: 0,
    numbersCalled: [],
    recentWinners: []
  });
  
  private updateInterval: Subscription;

  constructor(
    private authService: AuthService,
    private levelService: LevelService
  ) {
    this.initializeRealTimeData();
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      this.updateInterval.unsubscribe();
    }
  }

  //#region Métodos públicos
  
  /**
   * Obtiene estadísticas en tiempo real
   */
  getRealTimeStats() {
    return this.realTimeStats.asObservable();
  }
  
  /**
   * Obtiene estadísticas globales del juego
   */
  getGlobalStats(): Observable<GlobalGameStats> {
    return of(this.generateGlobalStats());
  }
  
  /**
   * Obtiene estadísticas detalladas del jugador actual
   */
  getPlayerStats(playerId: string): Observable<PlayerAggregatedStats> {
    return of(this.generatePlayerStats(playerId));
  }
  
  //#endregion
  
  //#region Métodos privados
  
  /**
   * Inicializa los datos en tiempo real
   */
  private initializeRealTimeData() {
    // Generar datos iniciales
    this.updateRealTimeData();
    
    // Actualizar cada 10 segundos
    this.updateInterval = timer(0, 10000).subscribe(() => {
      this.updateRealTimeData();
    });
  }
  
  /**
   * Actualiza los datos en tiempo real
   */
  private updateRealTimeData() {
    const current = this.realTimeStats.value;
    
    // Actualizar contadores con pequeñas variaciones
    const onlinePlayers = Math.max(50, Math.min(500, 
      current.onlinePlayers + Math.floor(Math.random() * 5) - 2
    ));
    
    const activeGames = Math.max(5, Math.min(50, 
      current.activeGames + Math.floor(Math.random() * 3) - 1
    ));
    
    // Añadir nuevo número llamado
    const now = new Date();
    const numbersCalled = [...current.numbersCalled];
    numbersCalled.unshift({
      number: Math.floor(Math.random() * 75) + 1,
      timestamp: now
    });
    
    // Mantener solo los 10 números más recientes
    if (numbersCalled.length > 10) {
      numbersCalled.pop();
    }
    
    // Ocasionalmente añadir un nuevo ganador (20% de probabilidad)
    let recentWinners = [...current.recentWinners];
    if (Math.random() < 0.2) {
      const playerId = `user_${Math.floor(Math.random() * 1000)}`;
      recentWinners.unshift({
        playerId,
        playerName: this.playerNames[Math.floor(Math.random() * this.playerNames.length)],
        avatar: this.avatars[Math.floor(Math.random() * this.avatars.length)],
        prize: Math.floor(Math.random() * 1000) + 100
      });
      
      // Mantener solo los 5 ganadores más recientes
      if (recentWinners.length > 5) {
        recentWinners.pop();
      }
    }
    
    // Actualizar el estado
    this.realTimeStats.next({
      onlinePlayers,
      activeGames,
      numbersCalled,
      recentWinners
    });
  }
  
  /**
   * Genera estadísticas globales del juego
   */
  private generateGlobalStats(): GlobalGameStats {
    const now = new Date();
    const dailyStats = [];
    
    // Generar datos de los últimos 30 días
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Base más un poco de variación aleatoria
      const baseGames = 50 + Math.floor(Math.random() * 30);
      const basePlayers = 100 + Math.floor(Math.random() * 50);
      
      // Añadir tendencia de crecimiento (más juegos los fines de semana)
      const dayOfWeek = date.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.5 : 1;
      
      dailyStats.push({
        date: dateStr,
        games: Math.floor(baseGames * weekendMultiplier),
        players: Math.floor(basePlayers * weekendMultiplier)
      });
    }
    
    return {
      totalGamesPlayed: 1500 + Math.floor(Math.random() * 500),
      totalPlayers: 500 + Math.floor(Math.random() * 200),
      averageGameDuration: 8.5,
      averagePlayersPerGame: 25,
      mostPopularGameMode: 'clásico',
      dailyStats,
      lastUpdated: now.toISOString(),
      completionRate: 0.85,
      averageCallsToWin: 42,
      fastestWin: 2.5,
      longestGame: 12.8,
      mostCommonWinningPattern: 'Línea completa',
      averagePrize: 350,
      totalPrizesAwarded: 125000,
      topPrize: 10000,
      activeTournaments: 3,
      upcomingTournaments: 2,
      playersOnline: this.realTimeStats.value.onlinePlayers,
      activeGames: this.realTimeStats.value.activeGames,
      numbersCalled: this.realTimeStats.value.numbersCalled,
      recentWinners: this.realTimeStats.value.recentWinners
    };
  }
  
  /**
   * Genera estadísticas detalladas para un jugador
   */
  private generatePlayerStats(playerId: string): PlayerAggregatedStats {
    const currentUser = this.authService.getCurrentUser();
    const totalXp = Math.floor(Math.random() * 10000) + 1000;
    const levelInfo = this.levelService.getLevel(totalXp);
    
    // Generar rendimiento por hora del día
    const hourlyPerformance = Array(24).fill(0).map((_, hour) => ({
      hour,
      gamesPlayed: Math.floor(Math.random() * 5) + 1,
      winRate: 0.1 + Math.random() * 0.3,
      averageScore: Math.floor(Math.random() * 500) + 100
    }));
    
    // Generar rendimiento por día de la semana
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const weeklyPerformance = days.map((day, index) => ({
      day,
      gamesPlayed: Math.floor(Math.random() * 8) + 2,
      winRate: 0.15 + (Math.random() * 0.25),
      averageScore: Math.floor(Math.random() * 600) + 100
    }));
    
    // Generar historial de partidas recientes
    const recentGames = Array(10).fill(null).map((_, i) => {
      const gameDate = new Date();
      gameDate.setDate(gameDate.getDate() - Math.floor(i / 2));
      
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
    
    // Calcular estadísticas agregadas
    const gamesPlayed = recentGames.length;
    const gamesWon = recentGames.filter(g => g.result === 'victory').length;
    const winRate = gamesPlayed > 0 ? gamesWon / gamesPlayed : 0;
    const totalPrizes = recentGames.reduce((sum, game) => sum + (game.prize || 0), 0);
    
    return {
      playerId,
      playerName: currentUser?.username || 'Jugador Anónimo',
      avatar: currentUser?.avatar || 'default-avatar',
      level: levelInfo.level,
      xp: totalXp,
      xpToNextLevel: levelInfo.xpToNextLevel,
      joinDate: '2025-08-10',
      lastPlayed: new Date().toISOString(),
      gamesPlayed,
      gamesWon,
      winRate,
      averageScore: Math.floor(Math.random() * 500) + 100,
      totalPrizes,
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
      largestPrize: Math.floor(Math.random() * 1000) + 500
    };
  }
  
  //#endregion
}

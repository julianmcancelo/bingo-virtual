/**
 * Modelo para representar un jugador en las estadísticas
 * @author Julián Cancelo <julian.cancelo@alumnos.fi.unlp.edu.ar>
 * @author Nicolás Otero <nicolas.otero@alumnos.fi.unlp.edu.ar>
 * @course Algoritmos y Estructuras de Datos III (ALED3)
 * @professor Sebastián Saldivar
 * @year 2025
 * @institution Instituto Beltran
 */

export interface PlayerStats {
  userId: string;
  username: string;
  cards: string[]; // IDs de los cartones del jugador
  markedNumbers: number[]; // Números marcados por el jugador
  bingoPatterns: {
    line: boolean;
    doubleLine: boolean;
    bingo: boolean;
    fourCorners: boolean;
  };
  position?: number; // Posición en la partida (1 = primero, 2 = segundo, etc.)
  xpEarned: number; // Experiencia ganada en la partida
  isWinner: boolean; // Si ganó la partida
}

export interface GameStats {
  id: string; // ID único de la partida
  startTime: Date; // Fecha y hora de inicio
  endTime?: Date; // Fecha y hora de finalización
  duration?: number; // Duración en segundos
  totalPlayers: number; // Cantidad total de jugadores
  winners: string[]; // IDs de los jugadores ganadores
  gameType: 'classic' | 'tournament' | 'custom';
  gameMode: 'single' | 'multiplayer';
  settings: {
    maxPlayers: number;
    victoryConditions: {
      line: boolean;
      doubleLine: boolean;
      bingo: boolean;
      fourCorners: boolean;
    };
  };
  players: PlayerStats[];
  numbersDrawn: number[]; // Números que salieron en el sorteo
  logs: GameLog[]; // Registros de eventos de la partida
  roomId: string; // ID de la sala de juego
  tournamentId?: string; // ID del torneo si aplica
  createdAt: Date;
  updatedAt: Date;
}

export interface GameLog {
  timestamp: Date;
  type: 'number_drawn' | 'player_joined' | 'player_left' | 'victory' | 'error' | 'info';
  message: string;
  data?: any; // Datos adicionales según el tipo de log
}

// Estadísticas agregadas de un jugador
export interface PlayerAggregatedStats {
  userId: string;
  username: string;
  totalGames: number;
  gamesWon: number;
  totalBingos: number;
  totalLines: number;
  totalDoubleLines: number;
  totalFourCorners: number;
  totalXp: number;
  averageGameDuration: number;
  winRate: number;
  lastPlayed: Date;
  achievements: string[];
}

// Estadísticas generales del juego
export interface GlobalGameStats {
  totalGamesPlayed: number;
  totalPlayers: number;
  averagePlayersPerGame: number;
  averageGameDuration: number;
  mostCommonNumber: number;
  leastCommonNumber: number;
  totalBingos: number;
  totalLines: number;
  totalDoubleLines: number;
  mostActivePlayer: {
    userId: string;
    username: string;
    gamesPlayed: number;
  };
  lastGames: Array<{
    id: string;
    date: Date;
    winner: string;
    totalPlayers: number;
  }>;
}

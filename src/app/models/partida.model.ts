/**
 * MODELO DE PARTIDA
 * 
 * @description Define la estructura de una partida de bingo
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 */

export interface JugadorPartida {
  id: string;
  nombre: string;
  cartones: number[][];
  aciertos: number;
  ganador: boolean;
}

export interface Partida {
  id: string;
  fechaInicio: Date;
  fechaFin?: Date;
  modoJuego: 'CLASICO' | 'X' | 'ESQUINAS' | 'CARTON_LLENO';
  estado: 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA';
  jugadores: JugadorPartida[];
  numerosCantados: number[];
  ganadores: string[]; // IDs de los jugadores ganadores
  duracionSegundos?: number;
  premio?: string;
}

export interface EstadisticasPartida {
  totalPartidas: number;
  partidasGanadas: number;
  mejorTiempo: number;
  promedioNumerosCantados: number;
  modoJuegoPreferido: string;
  ultimasPartidas: Partida[];
}

export interface EstadisticasTiempoReal {
  jugadoresEnLinea: number;
  partidasActivas: number;
  numerosLlamados: number;
  premiosRepartidos: number;
  ultimaActualizacion: Date;
}

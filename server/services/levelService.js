// Experiencia base necesaria para subir de nivel
const EXPERIENCIA_BASE = 100;
// Factor de crecimiento de la experiencia necesaria
const FACTOR_CRECIMIENTO = 1.5;

// Calcular la experiencia necesaria para el siguiente nivel
exports.calcularExperienciaSiguienteNivel = (nivel) => {
  return Math.floor(EXPERIENCIA_BASE * Math.pow(FACTOR_CRECIMIENTO, nivel - 1));
};

// Experiencia ganada por diferentes acciones
exports.EXPERIENCIA_POR_ACCION = {
  LINEA: 50,           // Por completar una línea
  DOBLE_LINEA: 100,    // Por completar dos líneas
  BINGO: 200,          // Por completar cartón (bingo)
  VICTORIA: 150,       // Por ganar una partida
  PARTICIPACION: 30,   // Por participar en una partida
  INICIO_SESION: 10,   // Por iniciar sesión (diario)
  INVITAR_AMIGO: 50    // Por invitar a un amigo que se registre
};

// Obtener información de nivel de un usuario
exports.obtenerNivelUsuario = async (usuarioId) => {
  const NivelUsuario = require('../models/NivelUsuario');
  try {
    let nivelUsuario = await NivelUsuario.obtenerPorUsuarioId(usuarioId);
    
    // Si no existe registro, crear uno
    if (!nivelUsuario) {
      nivelUsuario = await NivelUsuario.crear(usuarioId);
    }
    
    return {
      nivel: nivelUsuario.nivel,
      experiencia: nivelUsuario.experiencia,
      experienciaSiguienteNivel: nivelUsuario.experiencia_siguiente_nivel,
      progreso: (nivelUsuario.experiencia / nivelUsuario.experiencia_siguiente_nivel) * 100
    };
  } catch (error) {
    console.error('Error en obtenerNivelUsuario:', error);
    throw error;
  }
};

// Otorgar experiencia a un usuario
exports.otorgarExperiencia = async (usuarioId, accion) => {
  const NivelUsuario = require('../models/NivelUsuario');
  
  // Obtener la cantidad de experiencia según la acción
  const experiencia = this.EXPERIENCIA_POR_ACCION[accion];
  if (experiencia === undefined) {
    throw new Error(`Acción no válida: ${accion}`);
  }
  
  // Registrar la experiencia
  const resultado = await NivelUsuario.agregarExperiencia(usuarioId, experiencia);
  
  // Aquí podrías agregar notificaciones, logros, etc.
  
  return resultado;
};

// Obtener ranking de jugadores
exports.obtenerRanking = async (limite = 10) => {
  const NivelUsuario = require('../models/NivelUsuario');
  try {
    return await NivelUsuario.obtenerRanking(limite);
  } catch (error) {
    console.error('Error en obtenerRanking:', error);
    throw error;
  }
};

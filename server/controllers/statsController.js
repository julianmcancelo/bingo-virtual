const db = require('../config/database');

// Tipos de logros disponibles
const LOGRO_TIPOS = {
  BINGO: 'bingo',
  DOBLE_LINEA: 'doble_linea',
  LINEA: 'linea'
};

/**
 * Guarda las estadísticas de una partida
 */
exports.guardarEstadisticas = async (req, res) => {
  const { usuarioId, salaId, puntuacion, lineasCompletadas, duracion } = req.body;
  
  if (!usuarioId || !salaId) {
    return res.status(400).json({ 
      estado: 'error', 
      mensaje: 'Se requieren usuarioId y salaId' 
    });
  }

  try {
    const pool = await db.getPool();
    // Verificar si el usuario existe
    const [userCheck] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [usuarioId]);
    if (userCheck.length === 0) {
      return res.status(404).json({
        estado: 'error',
        mensaje: 'Usuario no encontrado'
      });
    }

    // Insertar estadísticas de la partida
    const [result] = await pool.execute(
      `INSERT INTO partidas_estadisticas 
       (usuario_id, sala_id, puntuacion, lineas_completadas, duracion) 
       VALUES (?, ?, ?, ?, ?)`,
      [usuarioId, salaId, puntuacion || 0, lineasCompletadas || 0, duracion || 0]
    );

    res.status(201).json({
      estado: 'éxito',
      partidaId: result.insertId
    });
  } catch (error) {
    console.error('Error al guardar estadísticas:', error);
    res.status(500).json({ 
      estado: 'error', 
      mensaje: 'Error al guardar las estadísticas de la partida',
      error: error.message
    });
  }
};

/**
 * Guarda el log de una partida
 */
exports.guardarLogPartida = async (req, res) => {
  const { partidaId, eventos } = req.body;
  
  if (!partidaId || !Array.isArray(eventos)) {
    return res.status(400).json({ 
      estado: 'error', 
      mensaje: 'Se requieren partidaId y un array de eventos' 
    });
  }

  try {
    const pool = await db.getPool();
    const values = eventos.map(evento => [
      partidaId,
      evento.tipo || 'evento',
      evento.mensaje || '',
      JSON.stringify(evento.datos || {}),
      new Date(evento.timestamp || Date.now())
    ]);

    if (values.length > 0) {
      await pool.query(
        'INSERT INTO logs_partidas (partida_id, tipo, mensaje, datos, timestamp) VALUES ?',
        [values]
      );
    }

    res.status(201).json({
      estado: 'éxito',
      eventosGuardados: values.length
    });
  } catch (error) {
    console.error('Error al guardar log de partida:', error);
    res.status(500).json({ 
      estado: 'error', 
      mensaje: 'Error al guardar el log de la partida',
      error: error.message
    });
  }
};

/**
 * Obtiene las estadísticas de un usuario
 */
exports.obtenerEstadisticasUsuario = async (req, res) => {
  const { usuarioId } = req.params;
  
  if (!usuarioId) {
    return res.status(400).json({ 
      estado: 'error', 
      mensaje: 'Se requiere el ID de usuario' 
    });
  }

  try {
    const pool = await db.getPool();
    
    // Obtener estadísticas generales
    const [estadisticas] = await pool.execute(
      `SELECT 
        COUNT(*) as partidas_jugadas,
        SUM(puntuacion) as puntuacion_total,
        SUM(lineas_completadas) as lineas_totales,
        AVG(duracion) as duracion_promedio
      FROM partidas_estadisticas 
      WHERE usuario_id = ?`,
      [usuarioId]
    );

    // Obtener logros
    // Obtener logros del usuario
    const [logros] = await pool.execute(
      `SELECT 
        tipo,
        COUNT(*) as cantidad
      FROM logs_partidas
      WHERE partida_id IN (SELECT id FROM partidas_estadisticas WHERE usuario_id = ?)
      AND tipo IN (?, ?, ?)
      GROUP BY tipo`,
      [usuarioId, LOGRO_TIPOS.BINGO, LOGRO_TIPOS.DOBLE_LINEA, LOGRO_TIPOS.LINEA]
    );

    // Formatear logros para la respuesta
    const logrosFormateados = logros.reduce((acc, logro) => ({
      ...acc,
      [logro.tipo]: logro.cantidad
    }), {
      [LOGRO_TIPOS.BINGO]: 0,
      [LOGRO_TIPOS.DOBLE_LINEA]: 0,
      [LOGRO_TIPOS.LINEA]: 0
    });

    // Formatear estadísticas
    const estadisticasFormateadas = {
      partidas_jugadas: parseInt(estadisticas[0]?.partidas_jugadas || 0, 10),
      puntuacion_total: parseInt(estadisticas[0]?.puntuacion_total || 0, 10),
      lineas_totales: parseInt(estadisticas[0]?.lineas_totales || 0, 10),
      duracion_promedio: parseFloat(estadisticas[0]?.duracion_promedio || 0).toFixed(2)
    };

    res.json({
      estado: 'éxito',
      estadisticas: estadisticasFormateadas,
      logros: logrosFormateados
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      estado: 'error', 
      mensaje: 'Error al obtener las estadísticas',
      error: error.message
    });
  }
};

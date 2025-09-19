const db = require('../config/database');
const { v4: uuidv4 } = require('uuid/v4');

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
  const gameStats = req.body;
  
  // Validar datos requeridos
  if (!gameStats || !gameStats.players || !Array.isArray(gameStats.players)) {
    console.error('Datos de partida inválidos:', gameStats);
    return res.status(400).json({ 
      estado: 'error', 
      mensaje: 'Formato de datos inválido. Se espera un objeto con un array de jugadores.' 
    });
  }

  try {
    const pool = await db.getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insertar estadísticas para cada jugador
      const results = [];
      const gameId = gameStats.gameId || `game_${Date.now()}`;
      
      for (const player of gameStats.players) {
        if (!player.userId) {
          console.warn('Jugador sin userId, omitiendo:', player);
          continue;
        }
        
        // Verificar si el usuario existe
        const [userCheck] = await connection.execute(
          'SELECT id FROM usuarios WHERE id = ?', 
          [player.userId]
        );
        
        if (userCheck.length === 0) {
          console.warn(`Usuario no encontrado: ${player.userId}`);
          continue;
        }
        
        // Calcular duración en segundos si se proporciona startTime
        let duration = gameStats.duration || 0;
        if (gameStats.startTime) {
          const startTime = new Date(gameStats.startTime);
          const endTime = gameStats.endTime ? new Date(gameStats.endTime) : new Date();
          duration = Math.round((endTime - startTime) / 1000);
        }
        
        // Insertar estadísticas de la partida para este jugador
        const [result] = await connection.execute(
          `INSERT INTO partidas_estadisticas 
           (usuario_id, sala_id, puntuacion, lineas_completadas, duracion, creado_en, actualizado_en) 
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            player.userId,
            gameId,
            player.score || 0,
            player.linesCompleted || 0,
            duration
          ]
        );
        
        // Registrar log de la partida si hay información de log
        if (player.logs && Array.isArray(player.logs)) {
          for (const log of player.logs) {
            await connection.execute(
              `INSERT INTO logs_partidas 
               (partida_id, tipo, mensaje, datos, timestamp) 
               VALUES (?, ?, ?, ?, ?)`,
              [
                result.insertId,
                log.type || 'evento',
                log.message || '',
                log.data ? JSON.stringify(log.data) : null,
                log.timestamp || new Date()
              ]
            );
          }
        }
        
        results.push({
          userId: player.userId,
          partidaId: result.insertId,
          gameId: gameId
        });
      }
      
      await connection.commit();
      
      res.status(201).json({
        estado: 'éxito',
        gameId: gameId,
        resultados: results
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('Error en la transacción:', error);
      throw error;
    } finally {
      connection.release();
    }
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

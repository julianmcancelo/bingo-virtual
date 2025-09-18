const { getPool } = require('../config/database');
const { calcularExperienciaSiguienteNivel } = require('../services/levelService');

class NivelUsuario {
  // Crear un nuevo registro de nivel para un usuario
  static async crear(usuarioId) {
    const pool = await getPool();
    try {
      const [result] = await pool.execute(
        'INSERT INTO niveles_usuarios (usuario_id, nivel, experiencia, experiencia_siguiente_nivel) VALUES (?, 1, 0, 100)',
        [usuarioId]
      );
      return await this.obtenerPorUsuarioId(usuarioId);
    } catch (error) {
      throw new Error(`Error al crear registro de nivel: ${error.message}`);
    }
  }

  // Obtener nivel de un usuario por su ID
  static async obtenerPorUsuarioId(usuarioId) {
    const pool = await getPool();
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM niveles_usuarios WHERE usuario_id = ? LIMIT 1',
        [usuarioId]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener nivel de usuario: ${error.message}`);
    }
  }

  // Añadir experiencia a un usuario
  static async agregarExperiencia(usuarioId, experiencia) {
    const pool = await getPool();
    let connection;
    
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Obtener el nivel actual del usuario
      const [niveles] = await connection.execute(
        'SELECT * FROM niveles_usuarios WHERE usuario_id = ? FOR UPDATE',
        [usuarioId]
      );
      
      let nivelUsuario = niveles[0];
      
      // Si no existe registro, crear uno
      if (!nivelUsuario) {
        await connection.execute(
          'INSERT INTO niveles_usuarios (usuario_id, nivel, experiencia, experiencia_siguiente_nivel) VALUES (?, 1, 0, 100)',
          [usuarioId]
        );
        nivelUsuario = { nivel: 1, experiencia: 0, experiencia_siguiente_nivel: 100 };
      }

      let { nivel, experiencia, experiencia_siguiente_nivel } = nivelUsuario;
      let nuevaExperiencia = experiencia + experiencia;
      let nuevoNivel = nivel;
      let experienciaRestante = nuevaExperiencia;
      let subioNivel = false;

      // Calcular si sube de nivel
      while (experienciaRestante >= experiencia_siguiente_nivel) {
        experienciaRestante -= experiencia_siguiente_nivel;
        nuevoNivel++;
        experiencia_siguiente_nivel = calcularExperienciaSiguienteNivel(nuevoNivel);
        subioNivel = true;
      }

      // Actualizar el registro
      await connection.execute(
        'UPDATE niveles_usuarios SET nivel = ?, experiencia = ?, experiencia_siguiente_nivel = ? WHERE usuario_id = ?',
        [nuevoNivel, experienciaRestante, experiencia_siguiente_nivel, usuarioId]
      );

      await connection.commit();
      
      return {
        nivel: nuevoNivel,
        experiencia: experienciaRestante,
        experiencia_siguiente_nivel,
        subioNivel,
        experienciaAnterior: experiencia,
        nivelAnterior: nivel
      };
    } catch (error) {
      if (connection) await connection.rollback();
      throw new Error(`Error al agregar experiencia: ${error.message}`);
    } finally {
      if (connection) connection.release();
    }
  }

  // Obtener ranking de jugadores por nivel
  static async obtenerRanking(limite = 10) {
    const pool = await getPool();
    try {
      const [rows] = await pool.execute(
        `SELECT u.nombre_usuario, nu.nivel, nu.experiencia, 
                nu.experiencia_siguiente_nivel,
                RANK() OVER (ORDER BY nu.nivel DESC, nu.experiencia DESC) as posicion
         FROM niveles_usuarios nu
         JOIN usuarios u ON nu.usuario_id = u.id
         ORDER BY posicion
         LIMIT ?`,
        [limite]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener ranking: ${error.message}`);
    }
  }
}

module.exports = NivelUsuario;

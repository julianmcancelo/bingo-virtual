const { getPool } = require('../config/database');
const bcrypt = require('bcryptjs');
const levelService = require('../services/levelService');

class Usuario {
  // Crear un nuevo usuario
  static async crear({ nombre_usuario, email, contrasena }) {
    const pool = await getPool();
    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);
    let connection;
    
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Insertar el usuario
      const [result] = await connection.execute(
        'INSERT INTO usuarios (nombre_usuario, email, contrasena) VALUES (?, ?, ?)',
        [nombre_usuario, email, contrasenaEncriptada]
      );
      
      const insertId = result.insertId;
      
      // Crear registro de nivel para el usuario
      await connection.execute(
        'INSERT INTO niveles_usuarios (usuario_id, nivel, experiencia, experiencia_siguiente_nivel) VALUES (?, 1, 0, 100)',
        [insertId]
      );
      
      await connection.commit();
      
      // Obtener y devolver el usuario con su información de nivel
      return await this.obtenerPorId(insertId, true);
    } catch (error) {
      if (connection) await connection.rollback();
      throw new Error(`Error al crear usuario: ${error.message}`);
    } finally {
      if (connection) connection.release();
    }
  }

  // Obtener usuario por ID con información de nivel
  static async obtenerPorId(id, incluirNivel = false) {
    const pool = await getPool();
    try {
      const [rows] = await pool.execute(
        'SELECT id, nombre_usuario, email, creado_en, actualizado_en FROM usuarios WHERE id = ? LIMIT 1',
        [id]
      );
      
      if (!rows[0]) return null;
      
      // Si se solicita incluir información de nivel
      if (incluirNivel) {
        const nivelInfo = await levelService.obtenerNivelUsuario(id);
        return { ...rows[0], nivel: nivelInfo };
      }
      
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  // Obtener usuario por email con información de nivel
  static async obtenerPorEmail(email, incluirNivel = false) {
    const pool = await getPool();
    try {
      const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ? LIMIT 1', [email]);
      
      if (!rows[0]) return null;
      
      // Si se solicita incluir información de nivel
      if (incluirNivel) {
        const nivelInfo = await levelService.obtenerNivelUsuario(rows[0].id);
        return { ...rows[0], nivel: nivelInfo };
      }
      
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  // Obtener usuario por nombre de usuario
  static async obtenerPorNombreUsuario(nombre_usuario) {
    const pool = await getPool();
    try {
      const [rows] = await pool.execute('SELECT * FROM usuarios WHERE nombre_usuario = ? LIMIT 1', [nombre_usuario]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error al buscar usuario por nombre de usuario: ${error.message}`);
    }
  }

  // Verificar credenciales
  static async verificarCredenciales(email, contrasena) {
    try {
      const usuario = await this.obtenerPorEmail(email);
      if (!usuario) return null;
      const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
      if (!esValido) return null;
      const { contrasena: _omit, ...usuarioSinContrasena } = usuario;
      return usuarioSinContrasena;
    } catch (error) {
      throw new Error(`Error al verificar credenciales: ${error.message}`);
    }
  }

  // Actualizar información del usuario
  static async actualizar(id, datosActualizados) {
    const pool = await getPool();
    try {
      const campos = [];
      const valores = [];
      for (const [clave, valor] of Object.entries(datosActualizados)) {
        if (clave === 'contrasena') continue;
        campos.push(`${clave} = ?`);
        valores.push(valor);
      }
      if (campos.length === 0) {
        return await this.obtenerPorId(id);
      }
      valores.push(id);
      const query = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
      await pool.execute(query, valores);
      return await this.obtenerPorId(id);
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  // Actualizar contraseña
  static async actualizarContrasena(id, nuevaContrasena) {
    const pool = await getPool();
    try {
      const salt = await bcrypt.genSalt(10);
      const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena, salt);
      await pool.execute('UPDATE usuarios SET contrasena = ? WHERE id = ?', [contrasenaEncriptada, id]);
      return true;
    } catch (error) {
      throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }
  }

  // Eliminar usuario
  static async eliminar(id) {
    const pool = await getPool();
    try {
      await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }
}

module.exports = Usuario;

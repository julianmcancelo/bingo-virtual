const { getPool } = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  // Crear un nuevo usuario
  static async crear({ nombre_usuario, email, contrasena }) {
    const pool = await getPool();
    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);
    try {
      const [result] = await pool.execute(
        'INSERT INTO usuarios (nombre_usuario, email, contrasena) VALUES (?, ?, ?)',
        [nombre_usuario, email, contrasenaEncriptada]
      );
      const insertId = result.insertId;
      return await this.obtenerPorId(insertId);
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  // Obtener usuario por ID
  static async obtenerPorId(id) {
    const pool = await getPool();
    try {
      const [rows] = await pool.execute(
        'SELECT id, nombre_usuario, email, creado_en, actualizado_en FROM usuarios WHERE id = ? LIMIT 1',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  // Obtener usuario por email
  static async obtenerPorEmail(email) {
    const pool = await getPool();
    try {
      const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ? LIMIT 1', [email]);
      return rows[0] || null;
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

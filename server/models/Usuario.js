const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  // Crear un nuevo usuario
  static async crear({ nombre_usuario, email, contrasena }) {
    try {
      // Encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);
      
      const result = db.prepare(
        'INSERT INTO usuarios (nombre_usuario, email, contrasena) VALUES (?, ?, ?)'
      ).run(nombre_usuario, email, contrasenaEncriptada);
      
      return this.obtenerPorId(result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  // Obtener usuario por ID
  static obtenerPorId(id) {
    try {
      return db.prepare('SELECT id, nombre_usuario, email, creado_en FROM usuarios WHERE id = ?')
        .get(id);
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  // Obtener usuario por email
  static obtenerPorEmail(email) {
    try {
      return db.prepare('SELECT * FROM usuarios WHERE email = ?')
        .get(email);
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  // Obtener usuario por nombre de usuario
  static obtenerPorNombreUsuario(nombre_usuario) {
    try {
      return db.prepare('SELECT * FROM usuarios WHERE nombre_usuario = ?')
        .get(nombre_usuario);
    } catch (error) {
      throw new Error(`Error al buscar usuario por nombre de usuario: ${error.message}`);
    }
  }

  // Verificar credenciales
  static async verificarCredenciales(email, contrasena) {
    try {
      const usuario = this.obtenerPorEmail(email);
      if (!usuario) return null;
      
      const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
      if (!esValido) return null;
      
      // No devolver la contraseña
      const { contrasena: _, ...usuarioSinContrasena } = usuario;
      return usuarioSinContrasena;
    } catch (error) {
      throw new Error(`Error al verificar credenciales: ${error.message}`);
    }
  }

  // Actualizar información del usuario
  static actualizar(id, datosActualizados) {
    try {
      const campos = [];
      const valores = [];
      
      // Construir la consulta dinámicamente
      for (const [clave, valor] of Object.entries(datosActualizados)) {
        if (clave === 'contrasena') continue; // Manejar la contraseña por separado
        campos.push(`${clave} = ?`);
        valores.push(valor);
      }
      
      if (campos.length === 0) {
        return this.obtenerPorId(id);
      }
      
      valores.push(id);
      
      const query = `
        UPDATE usuarios 
        SET ${campos.join(', ')}
        WHERE id = ?
      `;
      
      db.prepare(query).run(...valores);
      return this.obtenerPorId(id);
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  // Actualizar contraseña
  static async actualizarContrasena(id, nuevaContrasena) {
    try {
      const salt = await bcrypt.genSalt(10);
      const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena, salt);
      
      db.prepare('UPDATE usuarios SET contrasena = ? WHERE id = ?')
        .run(contrasenaEncriptada, id);
      
      return true;
    } catch (error) {
      throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }
  }

  // Eliminar usuario
  static eliminar(id) {
    try {
      // La eliminación en cascada se encargará de los registros relacionados
      db.prepare('DELETE FROM usuarios WHERE id = ?').run(id);
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }
}

module.exports = Usuario;

const { getPool } = require('../config/database');
const bcrypt = require('bcryptjs');
const levelService = require('../services/levelService');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Configuración
const AVATAR_UPLOAD_DIR = path.join(__dirname, '../../public/avatars');
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const NICKNAME_CHANGE_COOLDOWN_DAYS = 30; // Días de espera para cambiar el apodo

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

  // Obtener usuario por ID con información de nivel y perfil
  static async obtenerPorId(id, incluirNivel = false, esPerfilPublico = false) {
    const pool = await getPool();
    try {
      // Seleccionar campos básicos y de perfil
      let query = 'SELECT id, nombre_usuario, email, creado_en, actualizado_en, ';
      query += 'apodo, avatar_url, biografia, facebook_url, twitter_url, instagram_url, linkedin_url, ';
      query += 'fecha_ultimo_cambio_apodo, es_perfil_publico ';
      query += 'FROM usuarios WHERE id = ? LIMIT 1';
      
      const [rows] = await pool.execute(query, [id]);
      
      if (!rows[0]) return null;
      
      // Si es una solicitud de perfil público y el perfil no es público, devolver solo información básica
      if (esPerfilPublico && !rows[0].es_perfil_publico) {
        return {
          id: rows[0].id,
          nombre_usuario: rows[0].nombre_usuario,
          avatar_url: rows[0].avatar_url,
          es_perfil_publico: false
        };
      }
      
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

  // Validar si se puede cambiar el apodo
  static async puedeCambiarApodo(usuarioId) {
    const pool = await getPool();
    try {
      const [result] = await pool.execute(
        'SELECT fecha_ultimo_cambio_apodo FROM usuarios WHERE id = ?',
        [usuarioId]
      );
      
      if (!result[0] || !result[0].fecha_ultimo_cambio_apodo) {
        return { puedeCambiar: true, diasRestantes: 0 };
      }
      
      const ultimoCambio = new Date(result[0].fecha_ultimo_cambio_apodo);
      const ahora = new Date();
      const diasDesdeUltimoCambio = Math.floor((ahora - ultimoCambio) / (1000 * 60 * 60 * 24));
      const diasRestantes = NICKNAME_CHANGE_COOLDOWN_DAYS - diasDesdeUltimoCambio;
      
      return {
        puedeCambiar: diasDesdeUltimoCambio >= NICKNAME_CHANGE_COOLDOWN_DAYS,
        diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
        proximoCambioDisponible: new Date(ultimoCambio.getTime() + (NICKNAME_CHANGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000))
      };
    } catch (error) {
      throw new Error(`Error al verificar cambio de apodo: ${error.message}`);
    }
  }

  // Actualizar avatar del usuario (para carga de archivos)
  static async actualizarAvatar(usuarioId, archivo) {
    if (!archivo) {
      throw new Error('No se ha proporcionado ningún archivo');
    }
    
    // Validar tipo de archivo
    if (!ALLOWED_IMAGE_TYPES.includes(archivo.mimetype)) {
      throw new Error(`Tipo de archivo no permitido. Formatos aceptados: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
    }
    
    // Validar tamaño del archivo
    if (archivo.size > MAX_IMAGE_SIZE) {
      throw new Error(`El archivo es demasiado grande. Tamaño máximo permitido: ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
    }
    
    // Crear directorio si no existe
    if (!fs.existsSync(AVATAR_UPLOAD_DIR)) {
      fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
    }
    
    // Generar nombre único para el archivo
    const extension = path.extname(archivo.originalname).toLowerCase();
    const nombreArchivo = `${usuarioId}-${uuidv4()}${extension}`;
    const rutaArchivo = path.join(AVATAR_UPLOAD_DIR, nombreArchivo);
    
    try {
      // Mover archivo a la carpeta de avatares
      await fs.promises.rename(archivo.path, rutaArchivo);
      
      // Actualizar ruta del avatar en la base de datos
      const rutaRelativa = `/uploads/avatars/${nombreArchivo}`;
      await this.actualizar(usuarioId, { avatar_url: rutaRelativa });
      
      return { avatar_url: rutaRelativa };
    } catch (error) {
      // Si hay un error, intentar eliminar el archivo si se creó
      if (fs.existsSync(rutaArchivo)) {
        fs.unlinkSync(rutaArchivo);
      }
      throw new Error(`Error al actualizar el avatar: ${error.message}`);
    }
  }
  
  // Actualizar solo la URL del avatar (para selección de avatares existentes)
  static async actualizarAvatarUrl(usuarioId, avatarUrl) {
    const pool = await getPool();
    try {
      // Actualizar la URL del avatar en la base de datos
      await pool.execute(
        'UPDATE usuarios SET avatar_url = ?, actualizado_en = NOW() WHERE id = ?',
        [avatarUrl, usuarioId]
      );
      
      return { success: true, avatar_url: avatarUrl };
    } catch (error) {
      console.error('Error al actualizar la URL del avatar:', error);
      throw new Error('Error al actualizar la URL del avatar');
    }
  }
  
  // Actualizar información del perfil
  static async actualizarPerfil(usuarioId, datosPerfil) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Si se está actualizando el apodo, verificar si puede cambiarlo
      if (datosPerfil.apodo) {
        const { puedeCambiar, diasRestantes } = await this.puedeCambiarApodo(usuarioId);
        if (!puedeCambiar) {
          throw new Error(`Debes esperar ${diasRestantes} días para volver a cambiar tu apodo`);
        }
        
        // Actualizar la fecha del último cambio de apodo
        datosPerfil.fecha_ultimo_cambio_apodo = new Date().toISOString().slice(0, 19).replace('T', ' ');
      }
      
      // Preparar campos a actualizar
      const camposPermitidos = [
        'apodo', 'biografia', 'facebook_url', 'twitter_url', 
        'instagram_url', 'linkedin_url', 'es_perfil_publico',
        'fecha_ultimo_cambio_apodo'
      ];
      
      const campos = [];
      const valores = [];
      
      // Filtrar solo los campos permitidos
      for (const [clave, valor] of Object.entries(datosPerfil)) {
        if (camposPermitidos.includes(clave)) {
          campos.push(`${clave} = ?`);
          valores.push(valor);
        }
      }
      
      // Si no hay campos válidos para actualizar, retornar el perfil actual
      if (campos.length === 0) {
        return await this.obtenerPorId(usuarioId, false);
      }
      
      // Agregar la fecha de actualización
      campos.push('actualizado_en = NOW()');
      
      // Ejecutar la actualización
      const query = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
      valores.push(usuarioId);
      
      await connection.execute(query, valores);
      await connection.commit();
      
      // Devolver el perfil actualizado
      return await this.obtenerPorId(usuarioId, false);
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    } finally {
      connection.release();
    }
  }
  
  // Obtener perfil público de un usuario
  static async obtenerPerfilPublico(usuarioId) {
    try {
      return await this.obtenerPorId(usuarioId, true, true);
    } catch (error) {
      throw new Error(`Error al obtener perfil público: ${error.message}`);
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

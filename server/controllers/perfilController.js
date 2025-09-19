/**
 * Controlador para manejar las operaciones relacionadas con el perfil de usuario
 * 
 * @module controllers/perfilController
 * @requires express-validator
 * @requires multer
 * @requires path
 * @requires fs
 * @requires ../models/Usuario
 * @requires ../utils/responseHandler
 */

const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Usuario = require('../models/Usuario');
const { success, error, validation } = require('../utils/responseHandler');

// Configuración de multer para la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/avatars');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar un nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.usuario.id}-${uniqueSuffix}${ext}`);
  }
});

// Filtro para aceptar solo ciertos tipos de archivo
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'));
};

// Configurar multer con las opciones definidas
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Middleware para manejar la carga de archivos con multer
exports.uploadAvatar = upload.single('avatar');

/**
 * @typedef {Object} PerfilUsuario
 * @property {string} nombre_usuario - Nombre de usuario
 * @property {string} [apodo] - Apodo del usuario (opcional)
 * @property {string} [avatar_url] - URL de la imagen de perfil (opcional)
 * @property {string} [biografia] - Biografía del usuario (opcional)
 * @property {string} [facebook_url] - URL de Facebook (opcional)
 * @property {string} [twitter_url] - URL de Twitter (opcional)
 * @property {string} [instagram_url] - URL de Instagram (opcional)
 * @property {string} [linkedin_url] - URL de LinkedIn (opcional)
 * @property {boolean} [es_perfil_publico] - Indica si el perfil es público (opcional)
 */

/**
 * Obtiene el perfil del usuario autenticado
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Promise<void>}
 */
exports.obtenerMiPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.obtenerPorId(req.usuario.id, true);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Obtener información sobre el cambio de apodo
    const infoApodo = await Usuario.puedeCambiarApodo(req.usuario.id);
    
    // Formatear la respuesta
    const perfil = {
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      email: usuario.email,
      apodo: usuario.apodo,
      avatar_url: usuario.avatar_url,
      biografia: usuario.biografia,
      facebook_url: usuario.facebook_url,
      twitter_url: usuario.twitter_url,
      instagram_url: usuario.instagram_url,
      linkedin_url: usuario.linkedin_url,
      es_perfil_publico: usuario.es_perfil_publico,
      puede_cambiar_apodo: infoApodo.puedeCambiar,
      dias_restantes_para_cambiar_apodo: infoApodo.diasRestantes,
      proximo_cambio_apodo_disponible: infoApodo.proximoCambioDisponible,
      nivel: usuario.nivel
    };
    
    return res.status(200).json({
      success: true,
      data: perfil
    });
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Obtiene el perfil público de un usuario
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Promise<void>}
 */
exports.obtenerPerfilPublico = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener perfil en modo público
    const usuario = await Usuario.obtenerPerfilPublico(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Perfil no encontrado o no es público'
      });
    }
    
    // Si el perfil es privado y no es el dueño, devolver error
    if (!usuario.es_perfil_publico && usuario.id !== req.usuario?.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este perfil'
      });
    }
    
    // Formatear la respuesta
    const perfil = {
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      apodo: usuario.apodo || usuario.nombre_usuario,
      avatar_url: usuario.avatar_url,
      biografia: usuario.biografia,
      redes_sociales: {
        facebook: usuario.facebook_url,
        twitter: usuario.twitter_url,
        instagram: usuario.instagram_url,
        linkedin: usuario.linkedin_url
      },
      nivel: usuario.nivel,
      miembro_desde: usuario.creado_en
    };
    
    return res.status(200).json({
      success: true,
      data: perfil
    });
  } catch (err) {
    console.error('Error al obtener perfil público:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil público',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Actualiza el perfil del usuario autenticado
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Promise<void>}
 */
exports.actualizarPerfil = async (req, res) => {
  // Validar los datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array()
    });
  }
  
  try {
    // Extraer solo los campos permitidos
    const {
      apodo,
      biografia,
      facebook_url,
      twitter_url,
      instagram_url,
      linkedin_url,
      es_perfil_publico
    } = req.body;
    
    // Crear objeto con los datos a actualizar
    const datosActualizados = {};
    
    if (apodo !== undefined) datosActualizados.apodo = apodo;
    if (biografia !== undefined) datosActualizados.biografia = biografia;
    if (facebook_url !== undefined) datosActualizados.facebook_url = facebook_url;
    if (twitter_url !== undefined) datosActualizados.twitter_url = twitter_url;
    if (instagram_url !== undefined) datosActualizados.instagram_url = instagram_url;
    if (linkedin_url !== undefined) datosActualizados.linkedin_url = linkedin_url;
    if (es_perfil_publico !== undefined) {
      datosActualizados.es_perfil_publico = es_perfil_publico === 'true' || es_perfil_publico === true;
    }
    
    // Actualizar el perfil
    const usuarioActualizado = await Usuario.actualizarPerfil(req.usuario.id, datosActualizados);
    
    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: usuarioActualizado
    });
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el perfil',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


/**
 * Sube y actualiza el avatar del usuario
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Promise<void>}
 */
exports.subirAvatar = async (req, res) => {
  try {
    console.log('=== Iniciando subirAvatar ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    // Verificar si se está subiendo un archivo
    if (req.file) {
      // Actualizar la URL del avatar en la base de datos
      const avatarFileName = path.basename(req.file.filename);
      const avatarUrl = `/uploads/avatars/${avatarFileName}`;
      
      console.log('Nuevo archivo de avatar subido:', {
        filename: req.file.filename,
        path: req.file.path,
        avatarUrl: avatarUrl
      });
      
      await Usuario.actualizarAvatarUrl(req.usuario.id, avatarUrl);
      
      return res.status(200).json({
        success: true,
        message: 'Avatar actualizado correctamente',
        data: {
          avatar_url: avatarUrl
        }
      });
    } 
    // Manejar selección de avatar existente (JSON)
    else if (req.body && req.body.avatar) {
      const avatarFileName = req.body.avatar;
      
      // Extraer solo el nombre del archivo por si viene con ruta
      const baseFileName = path.basename(avatarFileName);
      
      // Verificar si es un avatar predefinido (solo el nombre del archivo)
      const predefinedAvatars = ['16.png', 'lightning.png', 'noctis.png', 'rinoa.png', 'squall.png'];
      const isPredefinedAvatar = predefinedAvatars.includes(baseFileName);
      
      if (isPredefinedAvatar) {
        try {
          // Guardar solo el nombre del archivo en la base de datos
          await Usuario.actualizarAvatarUrl(req.usuario.id, baseFileName);
          
          // Construir la URL para el frontend (apunta directamente a assets/avatars/)
          const frontendUrl = `/assets/avatars/${baseFileName}`;
          
          console.log('Avatar predefinido seleccionado:', baseFileName);
          return res.status(200).json({
            success: true,
            message: 'Avatar predefinido actualizado correctamente',
            data: {
              avatar_url: baseFileName,  // Solo el nombre del archivo para avatares predefinidos
              frontend_avatar_url: frontendUrl,  // Ruta directa a los assets
              is_predefined: true  // Bandera adicional
            }
          });
        } catch (error) {
          console.error('Error al procesar avatar predefinido:', error);
          return res.status(500).json({
            success: false,
            message: 'Error al procesar el avatar predefinido',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
      }
      
      // Para avatares personalizados, verificar si el archivo existe
      const avatarPath = path.join(__dirname, '../../public/uploads/avatars', baseFileName);
      const avatarExists = fs.existsSync(avatarPath);
      
      if (!avatarExists) {
        console.log('Avatar personalizado no encontrado en:', avatarPath);
        return res.status(400).json({
          success: false,
          message: 'El archivo de avatar seleccionado no existe en el servidor.'
        });
      }
      
      // Actualizar la URL del avatar en la base de datos
      const avatarUrl = `/uploads/avatars/${baseFileName}`;
      await Usuario.actualizarAvatarUrl(req.usuario.id, avatarUrl);
      
      console.log('Avatar personalizado actualizado correctamente:', avatarUrl);
      return res.status(200).json({
        success: true,
        message: 'Avatar actualizado correctamente',
        data: {
          avatar_url: avatarUrl
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo o avatar válido.'
      });
    }
  } catch (error) {
    console.error('Error en el controlador de avatar:', error);
    
    // Eliminar el archivo si se subió pero hubo un error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar el archivo temporal:', unlinkError);
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud de avatar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Elimina el avatar del usuario
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Promise<void>}
 */
exports.eliminarAvatar = async (req, res) => {
  try {
    // Obtener el usuario actual
    const usuario = await Usuario.obtenerPorId(req.usuario.id);
    
    if (!usuario.avatar_url) {
      return res.status(400).json({
        success: false,
        message: 'No tienes un avatar para eliminar'
      });
    }
    
    // Ruta completa del archivo de avatar
    const avatarPath = path.join(__dirname, '../../public', usuario.avatar_url);
    
    // Eliminar el archivo si existe
    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
    }
    
    // Actualizar la base de datos
    await Usuario.actualizar(req.usuario.id, { avatar_url: null });
    
    return res.status(200).json({
      success: true,
      message: 'Avatar eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar el avatar:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el avatar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verifica si el usuario puede cambiar su apodo
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Promise<void>}
 */
exports.verificarCambioApodo = async (req, res) => {
  try {
    const infoApodo = await Usuario.puedeCambiarApodo(req.usuario.id);
    
    return res.status(200).json({
      success: true,
      data: {
        puede_cambiar_apodo: infoApodo.puedeCambiar,
        dias_restantes: infoApodo.diasRestantes,
        proximo_cambio_disponible: infoApodo.proximoCambioDisponible
      }
    });
  } catch (error) {
    console.error('Error al verificar cambio de apodo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar el cambio de apodo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

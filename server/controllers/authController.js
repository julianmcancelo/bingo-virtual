const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Generar token JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRETO || 'secreto_para_desarrollo', {
    expiresIn: '30d', // 30 días de validez
  });
};

// Controlador para cerrar sesión (stateless; el cliente elimina el token)
exports.cerrarSesion = async (req, res, next) => {
  try {
    // Si quisiéramos invalidar tokens, habría que mantener una blacklist.
    // Por ahora, solo respondemos éxito y el cliente borra el token localmente.
    res.status(200).json({
      estado: 'éxito',
      mensaje: 'Sesión cerrada'
    });
  } catch (error) {
    next(error);
  }
};

// Controlador para refrescar token
exports.refrescarToken = async (req, res, next) => {
  try {
    // Requiere autenticación previa (middleware proteger)
    const nuevoToken = jwt.sign(
      { id: req.usuario.id },
      process.env.JWT_SECRETO || 'secreto_para_desarrollo',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      estado: 'éxito',
      token: nuevoToken
    });
  } catch (error) {
    next(error);
  }
};

// Controlador para registro de usuarios
exports.registro = async (req, res, next) => {
  try {
    const { nombre_usuario, email, contrasena, confirmar_contrasena } = req.body;

    // Validaciones básicas
    if (!nombre_usuario || !email || !contrasena) {
      return res.status(400).json({ 
        estado: 'error', 
        mensaje: 'Por favor, proporcione nombre de usuario, email y contraseña' 
      });
    }

    if (contrasena !== confirmar_contrasena) {
      return res.status(400).json({ 
        estado: 'error', 
        mensaje: 'Las contraseñas no coinciden' 
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.obtenerPorEmail(email) || 
                            await Usuario.obtenerPorNombreUsuario(nombre_usuario);
    
    if (usuarioExistente) {
      return res.status(400).json({ 
        estado: 'error', 
        mensaje: 'El correo electrónico o nombre de usuario ya está en uso' 
      });
    }

    // Crear nuevo usuario
    const usuario = await Usuario.crear({
      nombre_usuario,
      email,
      contrasena
    });

    // Generar token
    const token = generarToken(usuario.id);

    // Obtener información del nivel del usuario
    const levelService = require('../services/levelService');
    const nivelInfo = await levelService.obtenerNivelUsuario(usuario.id);
    
    // Enviar respuesta con información del nivel
    res.status(201).json({
      estado: 'éxito',
      token,
      usuario: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        email: usuario.email,
        nivel: nivelInfo
      }
    });

  } catch (error) {
    next(error);
  }
};

// Controlador para inicio de sesión
exports.iniciarSesion = async (req, res, next) => {
  try {
    const { email, contrasena } = req.body;

    // 1) Verificar si el usuario existe y la contraseña es correcta
    const usuario = await Usuario.obtenerPorEmail(email);
    
    if (!usuario || !(await usuario.verificarContrasena(contrasena))) {
      return res.status(401).json({
        estado: 'error',
        mensaje: 'Credenciales inválidas'
      });
    }

    // 2) Generar token JWT
    const token = generarToken(usuario.id);
    
    // 3) Obtener información del nivel del usuario
    const levelService = require('../services/levelService');
    const nivelInfo = await levelService.obtenerNivelUsuario(usuario.id);

    // 4) Enviar respuesta exitosa con token e información del usuario
    res.status(200).json({
      estado: 'éxito',
      token,
      usuario: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        email: usuario.email,
        nivel: nivelInfo
      }
    });
  } catch (error) {
    next(error);
  }
};

// Middleware para proteger rutas
exports.proteger = async (req, res, next) => {
  try {
    let token;
    
    // Obtener el token del encabezado de autorización
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ 
        estado: 'error', 
        mensaje: 'No estás autenticado. Por favor inicia sesión para continuar' 
      });
    }

    // Verificar token
    const decodificado = jwt.verify(token, process.env.JWT_SECRETO || 'secreto_para_desarrollo');
    
    // Verificar si el usuario aún existe
    const usuarioActual = await Usuario.obtenerPorId(decodificado.id);
    if (!usuarioActual) {
      return res.status(401).json({ 
        estado: 'error', 
        mensaje: 'El usuario perteneciente a este token ya no existe' 
      });
    }

    // Añadir usuario al objeto de solicitud
    req.usuario = usuarioActual;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        estado: 'error', 
        mensaje: 'Token inválido' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        estado: 'error', 
        mensaje: 'Tu sesión ha expirado. Por favor inicia sesión de nuevo' 
      });
    }
    next(error);
  }
};

// Controlador para obtener el perfil del usuario actual
exports.obtenerPerfil = async (req, res, next) => {
  try {
    // El usuario ya está disponible gracias al middleware de autenticación
    const usuario = await Usuario.obtenerPorId(req.usuario.id, true); // Incluir información de nivel
    
    if (!usuario) {
      return res.status(404).json({
        estado: 'error',
        mensaje: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      estado: 'éxito',
      usuario
    });
  } catch (error) {
    next(error);
  }
};

// Controlador para actualizar perfil de usuario
exports.actualizarPerfil = async (req, res, next) => {
  try {
    // Filtrar solo los campos permitidos para actualizar
    const datosActualizados = {};
    const { nombre_usuario, email } = req.body;
    
    if (nombre_usuario) datosActualizados.nombre_usuario = nombre_usuario;
    if (email) datosActualizados.email = email;
    
    const usuario = await Usuario.actualizar(req.usuario.id, datosActualizados);
    
    res.status(200).json({
      estado: 'éxito',
      datos: {
        usuario
      }
    });
  } catch (error) {
    next(error);
  }
};

// Controlador para actualizar contraseña
exports.actualizarContrasena = async (req, res, next) => {
  try {
    const { contrasena_actual, nueva_contrasena, confirmar_contrasena } = req.body;
    
    // Validar datos de entrada
    if (!contrasena_actual || !nueva_contrasena) {
      return res.status(400).json({ 
        estado: 'error', 
        mensaje: 'Por favor proporcione la contraseña actual y la nueva contraseña' 
      });
    }
    
    if (nueva_contrasena !== confirmar_contrasena) {
      return res.status(400).json({ 
        estado: 'error', 
        mensaje: 'Las contraseñas no coinciden' 
      });
    }
    
    // Verificar contraseña actual
    const usuario = await Usuario.obtenerPorId(req.usuario.id);
    const esValida = await Usuario.verificarCredenciales(usuario.email, contrasena_actual);
    
    if (!esValida) {
      return res.status(401).json({ 
        estado: 'error', 
        mensaje: 'La contraseña actual es incorrecta' 
      });
    }
    
    // Actualizar contraseña
    await Usuario.actualizarContrasena(req.usuario.id, nueva_contrasena);
    
    res.status(200).json({
      estado: 'éxito',
      mensaje: 'Contraseña actualizada correctamente'
    });
    
  } catch (error) {
    next(error);
  }
};

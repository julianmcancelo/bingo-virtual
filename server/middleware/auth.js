/**
 * Middleware de autenticación
 * 
 * @module middleware/auth
 * @requires jsonwebtoken
 * @requires dotenv
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware para verificar el token de autenticación
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const auth = async (req, res, next) => {
  try {
    // Obtener el token del encabezado de autorización
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Verificar si hay un token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token de autenticación.'
      });
    }
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRETO);
    
    // Agregar el ID del usuario al objeto de solicitud
    req.usuario = { id: decoded.usuario.id };
    
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    
    // Manejar diferentes tipos de errores de JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación inválido.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'La sesión ha expirado. Por favor, inicia sesión nuevamente.'
      });
    }
    
    // Para otros errores
    res.status(500).json({
      success: false,
      message: 'Error en el servidor durante la autenticación.'
    });
  }
};

module.exports = auth;

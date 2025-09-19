/**
 * Manejador de respuestas estandarizadas para la API
 * 
 * @module utils/responseHandler
 */

/**
 * Respuesta exitosa
 * @param {Object} res - Objeto de respuesta de Express
 * @param {*} data - Datos a enviar en la respuesta
 * @param {string} [message='Operación exitosa'] - Mensaje descriptivo
 * @param {number} [statusCode=200] - Código de estado HTTP
 */
const success = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
  const response = {
    success: true,
    message,
    data
  };
  
  // Si no hay datos, eliminamos la propiedad del objeto de respuesta
  if (data === null) {
    delete response.data;
  }
  
  res.status(statusCode).json(response);
};

/**
 * Respuesta de error
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} message - Mensaje de error
 * @param {number} [statusCode=500] - Código de estado HTTP
 * @param {*} [error=null] - Detalles del error (solo en desarrollo)
 */
const error = (res, message, statusCode = 500, error = null) => {
  const response = {
    success: false,
    message
  };
  
  // En desarrollo, incluir detalles del error
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message || error;
    response.stack = error.stack;
  }
  
  res.status(statusCode).json(response);
};

/**
 * Respuesta de error de validación
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Array} errors - Lista de errores de validación
 * @param {string} [message='Error de validación'] - Mensaje descriptivo
 */
const validation = (res, errors, message = 'Error de validación') => {
  res.status(400).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  });
};

/**
 * Respuesta de recurso no encontrado
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} [message='Recurso no encontrado'] - Mensaje descriptivo
 */
const notFound = (res, message = 'Recurso no encontrado') => {
  res.status(404).json({
    success: false,
    message
  });
};

/**
 * Respuesta de no autorizado
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} [message='No autorizado'] - Mensaje descriptivo
 */
const unauthorized = (res, message = 'No autorizado') => {
  res.status(401).json({
    success: false,
    message
  });
};

/**
 * Respuesta de prohibido
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} [message='Acceso prohibido'] - Mensaje descriptivo
 */
const forbidden = (res, message = 'Acceso prohibido') => {
  res.status(403).json({
    success: false,
    message
  });
};

module.exports = {
  success,
  error,
  validation,
  notFound,
  unauthorized,
  forbidden
};

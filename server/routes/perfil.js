/**
 * Rutas para la gestión del perfil de usuario
 * 
 * @module routes/perfil
 * @requires express
 * @requires express-validator
 * @requires ../middleware/auth
 * @requires ../controllers/perfilController
 */

const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const perfilController = require('../controllers/perfilController');

// @route   GET api/perfil/mi-perfil
// @desc    Obtener el perfil del usuario autenticado
// @access  Privado
router.get('/mi-perfil', auth, perfilController.obtenerMiPerfil);

// @route   GET api/perfil/:id
// @desc    Obtener perfil público de un usuario
// @access  Público (pero puede estar restringido si el perfil es privado)
router.get('/:id', perfilController.obtenerPerfilPublico);

// @route   PUT api/perfil/actualizar
// @desc    Actualizar perfil del usuario
// @access  Privado
router.put(
  '/actualizar',
  [
    auth,
    [
      check('apodo', 'El apodo debe tener entre 3 y 30 caracteres')
        .optional()
        .isLength({ min: 3, max: 30 }),
      check('biografia', 'La biografía no puede exceder los 500 caracteres')
        .optional()
        .isLength({ max: 500 }),
      check('facebook_url', 'URL de Facebook no válida')
        .optional()
        .isURL()
        .withMessage('Debe ser una URL válida')
        .matches(/^(https?:\/\/)?(www\.)?facebook\.com\/.+/)
        .withMessage('Debe ser una URL de Facebook válida'),
      check('twitter_url', 'URL de Twitter no válida')
        .optional()
        .isURL()
        .withMessage('Debe ser una URL válida')
        .matches(/^(https?:\/\/)?(www\.)?twitter\.com\/.+/)
        .withMessage('Debe ser una URL de Twitter válida'),
      check('instagram_url', 'URL de Instagram no válida')
        .optional()
        .isURL()
        .withMessage('Debe ser una URL válida')
        .matches(/^(https?:\/\/)?(www\.)?instagram\.com\/.+/)
        .withMessage('Debe ser una URL de Instagram válida'),
      check('linkedin_url', 'URL de LinkedIn no válida')
        .optional()
        .isURL()
        .withMessage('Debe ser una URL válida')
        .matches(/^(https?:\/\/)?(www\.)?linkedin\.com\/.+/)
        .withMessage('Debe ser una URL de LinkedIn válida'),
      check('es_perfil_publico', 'El valor de visibilidad del perfil no es válido')
        .optional()
        .isBoolean()
    ]
  ],
  perfilController.actualizarPerfil
);

// @route   POST api/perfil/avatar
// @desc    Subir o actualizar el avatar del usuario
// @access  Privado
router.post('/avatar', 
  auth, 
  // Middleware para manejar JSON
  express.json(),
  // Middleware para manejar form-data (archivos)
  (req, res, next) => {
    // Si ya se procesó un archivo o hay un avatar en el body, continuar
    if (req.file || (req.body && req.body.avatar)) {
      return next();
    }
    // Si no hay archivo ni avatar, intentar parsear como JSON
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return express.json()(req, res, next);
    }
    next();
  },
  perfilController.subirAvatar
);

// @route   DELETE api/perfil/avatar
// @desc    Eliminar el avatar del usuario
// @access  Privado
router.delete('/avatar', auth, perfilController.eliminarAvatar);

// @route   GET api/perfil/verificar-cambio-apodo
// @desc    Verificar si el usuario puede cambiar su apodo
// @access  Privado
router.get('/verificar-cambio-apodo', auth, perfilController.verificarCambioApodo);

module.exports = router;

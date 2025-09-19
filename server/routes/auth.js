const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Middleware para log de solicitudes
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Ruta para refrescar el token (soporta GET y POST para compatibilidad)
router.route('/refresh-token')
  .get(authController.refrescarToken)
  .post(authController.refrescarToken);

// Otras rutas de autenticación
router.post('/registro', authController.registro);
router.post('/iniciar-sesion', authController.iniciarSesion);
router.post('/cerrar-sesion', authController.cerrarSesion);

module.exports = router;

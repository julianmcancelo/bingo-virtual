const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Middleware para log de solicitudes
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Ruta para refrescar el token (soporta GET y POST para compatibilidad)
router.route('/refresh-token')
  .get(auth, authController.refrescarToken)
  .post(auth, authController.refrescarToken);

// Otras rutas de autenticación
router.post('/registro', authController.registro);
router.post('/iniciar-sesion', authController.iniciarSesion);
router.post('/cerrar-sesion', auth, authController.cerrarSesion);

module.exports = router;

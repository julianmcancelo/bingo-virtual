const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authRoutes = require('./auth');
const perfilRoutes = require('./perfil');

// Middleware para log de solicitudes
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Middleware para manejar CORS preflight
router.options('*', (req, res) => {
  console.log('Preflight request recibida');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de perfil
router.use('/perfil', perfilRoutes);

// Rutas de estadísticas
router.post('/games/stats', statsController.guardarEstadisticas);

// Ruta para guardar logs de partida
router.post('/games/:gameId/logs', (req, res, next) => {
  console.log('Solicitud de guardado de log recibida en ruta:', {
    gameId: req.params.gameId,
    body: req.body,
    headers: req.headers
  });
  next();
}, statsController.guardarLogPartida);

// Ruta para obtener estadísticas de usuario
router.get('/users/:usuarioId/stats', statsController.obtenerEstadisticasUsuario);

// Ruta de prueba para verificar que la API está funcionando
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API de Bingo Virtual funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de perfil de usuario
router.use('/perfil', perfilRoutes);

// Manejador de errores global
router.use((err, req, res, next) => {
  console.error('Error en la API:', err);
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Manejador para rutas no encontradas
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = router;

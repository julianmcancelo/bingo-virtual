const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Rutas de estadísticas
router.post('/games/stats', statsController.guardarEstadisticas);
router.post('/games/:gameId/logs', statsController.guardarLogPartida);
router.get('/users/:usuarioId/stats', statsController.obtenerEstadisticasUsuario);

module.exports = router;

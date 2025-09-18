const levelService = require('../services/levelService');

// Obtener información de nivel del usuario actual
exports.obtenerMiNivel = async (req, res) => {
  try {
    const usuarioId = req.user.id; // Asumiendo que tienes el ID del usuario en req.user
    const nivelInfo = await levelService.obtenerNivelUsuario(usuarioId);
    res.json(nivelInfo);
  } catch (error) {
    console.error('Error en obtenerMiNivel:', error);
    res.status(500).json({ error: 'Error al obtener información de nivel' });
  }
};

// Obtener ranking de jugadores
exports.obtenerRanking = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    const ranking = await levelService.obtenerRanking(limite);
    res.json(ranking);
  } catch (error) {
    console.error('Error en obtenerRanking:', error);
    res.status(500).json({ error: 'Error al obtener el ranking' });
  }
};

// Otorgar experiencia (solo para pruebas, en producción esto se haría automáticamente)
exports.otorgarExperiencia = async (req, res) => {
  try {
    const { accion } = req.body;
    const usuarioId = req.user.id;
    
    const resultado = await levelService.otorgarExperiencia(usuarioId, accion);
    
    res.json({
      mensaje: 'Experiencia otorgada correctamente',
      ...resultado
    });
  } catch (error) {
    console.error('Error en otorgarExperiencia:', error);
    res.status(500).json({ error: error.message });
  }
};

-- Crear tabla de partidas
CREATE TABLE IF NOT EXISTS partidas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  sala_id VARCHAR(255) NOT NULL,
  puntuacion INT NOT NULL DEFAULT 0,
  lineas_completadas INT NOT NULL DEFAULT 0,
  duracion INT NOT NULL DEFAULT 0 COMMENT 'Duración en segundos',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de logs de partidas
CREATE TABLE IF NOT EXISTS logs_partidas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  partida_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL COMMENT 'Tipo de evento (bingo, linea, doble_linea, etc)',
  mensaje TEXT,
  datos JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_partidas_usuario_id ON partidas(usuario_id);
CREATE INDEX idx_partidas_sala_id ON partidas(sala_id);
CREATE INDEX idx_logs_partida_id ON logs_partidas(partida_id);
CREATE INDEX idx_logs_tipo ON logs_partidas(tipo);

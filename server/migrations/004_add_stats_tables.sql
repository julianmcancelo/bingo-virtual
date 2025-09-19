-- Crear tabla de partidas_estadisticas si no existe
CREATE TABLE IF NOT EXISTS `partidas_estadisticas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `sala_id` varchar(255) NOT NULL,
  `puntuacion` int NOT NULL DEFAULT '0',
  `lineas_completadas` int NOT NULL DEFAULT '0',
  `duracion` int NOT NULL DEFAULT '0' COMMENT 'Duración en segundos',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_partidas_estadisticas_usuario_id` (`usuario_id`),
  KEY `idx_partidas_estadisticas_sala_id` (`sala_id`),
  CONSTRAINT `partidas_estadisticas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de logs_partidas si no existe
CREATE TABLE IF NOT EXISTS `logs_partidas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `partida_id` int NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo de evento (bingo, linea, doble_linea, etc)',
  `mensaje` text COLLATE utf8mb4_unicode_ci,
  `datos` json DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `partida_id` (`partida_id`),
  KEY `idx_logs_partida_id` (`partida_id`),
  KEY `idx_logs_tipo` (`tipo`),
  CONSTRAINT `logs_partidas_ibfk_1` FOREIGN KEY (`partida_id`) REFERENCES `partidas_estadisticas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Asegurarse de que los índices existan
CREATE INDEX IF NOT EXISTS `idx_partidas_estadisticas_usuario_id` ON `partidas_estadisticas` (`usuario_id`);
CREATE INDEX IF NOT EXISTS `idx_partidas_estadisticas_sala_id` ON `partidas_estadisticas` (`sala_id`);
CREATE INDEX IF NOT EXISTS `idx_logs_partida_id` ON `logs_partidas` (`partida_id`);
CREATE INDEX IF NOT EXISTS `idx_logs_tipo` ON `logs_partidas` (`tipo`);

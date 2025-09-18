-- Crear tabla niveles_usuarios
CREATE TABLE IF NOT EXISTS niveles_usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nivel INT NOT NULL DEFAULT 1,
    experiencia INT NOT NULL DEFAULT 0,
    experiencia_siguiente_nivel INT NOT NULL DEFAULT 100,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear índice para búsquedas por usuario
CREATE INDEX idx_niveles_usuarios_usuario_id ON niveles_usuarios(usuario_id);

-- Insertar datos iniciales para usuarios existentes (opcional)
-- INSERT INTO niveles_usuarios (usuario_id, nivel, experiencia, experiencia_siguiente_nivel)
-- SELECT id, 1, 0, 100 FROM usuarios
-- WHERE id NOT IN (SELECT usuario_id FROM niveles_usuarios);

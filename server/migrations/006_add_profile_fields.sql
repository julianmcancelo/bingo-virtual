-- Migración para agregar campos de perfil a la tabla usuarios
-- Autores: Julián Cancelo, Nicolás Otero
-- Materia: Algoritmos y Estructuras de Datos III (ALED3)
-- Profesor: Sebastián Saldivar
-- Institución: Instituto Beltran
-- Fecha: Septiembre 2024

-- Agregar nuevos campos a la tabla usuarios
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS apodo VARCHAR(50) NULL COMMENT 'Apodo del usuario (puede ser modificado cada 30 días)',
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) NULL COMMENT 'URL de la imagen de perfil del usuario',
ADD COLUMN IF NOT EXISTS biografia TEXT NULL COMMENT 'Biografía o descripción del usuario',
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255) NULL COMMENT 'URL de perfil de Facebook',
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255) NULL COMMENT 'URL de perfil de Twitter',
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255) NULL COMMENT 'URL de perfil de Instagram',
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255) NULL COMMENT 'URL de perfil de LinkedIn',
ADD COLUMN IF NOT EXISTS fecha_ultimo_cambio_apodo DATETIME NULL COMMENT 'Fecha del último cambio de apodo',
ADD COLUMN IF NOT EXISTS es_perfil_publico BOOLEAN DEFAULT TRUE COMMENT 'Indica si el perfil es público o privado';

-- Crear índice para búsquedas por apodo
CREATE INDEX IF NOT EXISTS idx_usuario_apodo ON usuarios(apodo);

-- Comentarios para documentación
ALTER TABLE usuarios 
COMMENT 'Tabla de usuarios del sistema con información de perfil';

-- Actualizar la fecha de actualización del esquema
INSERT INTO schema_migrations (version, nombre_migracion, fecha_ejecucion) 
VALUES (6, '006_add_profile_fields', NOW());

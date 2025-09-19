const mysql = require('mysql2/promise');

// Parámetros desde variables de entorno
const {
  DB_HOST = '167.250.5.55',
  DB_PORT = '3306',
  DB_USER = 'jcancelo_aled',
  DB_PASSWORD = 'feelthesky1',
  DB_NAME = 'jcancelo_aled',
  DB_SSL = 'false',
  DB_SSL_REJECT_UNAUTHORIZED = 'false'
} = process.env;

let pool;

async function createPool() {
  if (pool) return pool;
  // Log seguro (no imprime contraseña)
  console.log(`[DB] Config -> host: ${DB_HOST}, port: ${DB_PORT}, db: ${DB_NAME}, user: ${DB_USER}, ssl: ${DB_SSL}`);

  const sslEnabled = String(DB_SSL).toLowerCase() === 'true';
  const sslRejectUnauthorized = String(DB_SSL_REJECT_UNAUTHORIZED).toLowerCase() === 'true';

  const poolConfig = {
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  if (sslEnabled) {
    poolConfig.ssl = { rejectUnauthorized: sslRejectUnauthorized };
  }

  pool = mysql.createPool(poolConfig);
  return pool;
}

async function initDatabase() {
  const pool = await createPool();
  // Crear tablas si no existen (equivalentes MySQL)
  
  // Tabla usuarios
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      contrasena VARCHAR(255) NOT NULL,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // tokens
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL,
      token VARCHAR(255) NOT NULL,
      tipo ENUM('refresh', 'reset_password', 'verify_email') NOT NULL,
      expira_en DATETIME NOT NULL,
      usado BOOLEAN DEFAULT FALSE,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      INDEX idx_tokens_usuario_id (usuario_id),
      INDEX idx_tokens_token (token)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Tabla niveles_usuarios
  await pool.query(`
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
  `);

  // Crear índice para búsquedas por usuario si no existe
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_niveles_usuarios_usuario_id 
    ON niveles_usuarios(usuario_id);
  `);

  // salas_partida (renombrada de partidas para evitar conflicto)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS salas_partida (
      id INT AUTO_INCREMENT PRIMARY KEY,
      codigo_sala VARCHAR(255) NOT NULL UNIQUE,
      estado VARCHAR(50) NOT NULL DEFAULT 'esperando',
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      finalizado_en TIMESTAMP NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // jugadores_partida
  await pool.query(`
    CREATE TABLE IF NOT EXISTS jugadores_partida (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL,
      partida_id INT NOT NULL,
      puntuacion INT DEFAULT 0,
      gano TINYINT(1) DEFAULT 0,
      CONSTRAINT fk_jp_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      CONSTRAINT fk_jp_partida FOREIGN KEY (partida_id) REFERENCES salas_partida(id) ON DELETE CASCADE,
      UNIQUE KEY uq_usuario_partida (usuario_id, partida_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('[DB] Tablas MySQL verificadas/inicializadas');

  // Crear tablas de estadísticas
  try {
    // Tabla partidas (para estadísticas)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS partidas_estadisticas (
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
    `);

    // Tabla logs_partidas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs_partidas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        partida_id INT NOT NULL,
        tipo VARCHAR(50) NOT NULL COMMENT 'Tipo de evento (bingo, linea, doble_linea, etc)',
        mensaje TEXT,
        datos JSON,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (partida_id) REFERENCES partidas_estadisticas(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Crear índices para estadísticas
    await pool.query('CREATE INDEX IF NOT EXISTS idx_partidas_estadisticas_usuario_id ON partidas_estadisticas(usuario_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_partidas_estadisticas_sala_id ON partidas_estadisticas(sala_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_logs_partida_id ON logs_partidas(partida_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_logs_tipo ON logs_partidas(tipo)');

    console.log('[DB] Tablas de estadísticas creadas correctamente');
  } catch (error) {
    console.error('Error al crear tablas de estadísticas:', error);
    throw error;
  }
}

// Inicializar al cargar
initDatabase().catch(err => {
  console.error('[DB] Error durante la inicialización:', err);
});

module.exports = {
  getPool: createPool
};

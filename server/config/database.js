const mysql = require('mysql2/promise');
require('dotenv').config();

// Obtener configuración según el entorno
const isProduction = process.env.NODE_ENV === 'production';

// Configuración de la base de datos
const dbConfig = {
  // Configuración común
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS !== 'false',
  connectTimeout: 10000,
  acquireTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  
  // Configuración específica por entorno
  ...(isProduction ? {
    // Configuración para producción
    host: process.env.PROD_DB_HOST || '167.250.5.55',
    port: parseInt(process.env.PROD_DB_PORT || '3306', 10),
    user: process.env.PROD_DB_USER || 'jcancelo_aled',
    password: process.env.PROD_DB_PASSWORD || 'feelthesky1',
    database: process.env.PROD_DB_NAME || 'jcancelo_aled',
    ssl: false, // Deshabilitar SSL explícitamente
    sslmode: 'DISABLED' // Asegurar que SSL esté deshabilitado
  } : {
    // Configuración para desarrollo
    host: process.env.PROD_DB_HOST || '167.250.5.55',
    port: parseInt(process.env.PROD_DB_PORT || '3306', 10),
    user: process.env.PROD_DB_USER || 'jcancelo_aled',
    password: process.env.PROD_DB_PASSWORD || 'feelthesky1',
    database: process.env.PROD_DB_NAME || 'jcancelo_aled',
    ssl: false, // Deshabilitar SSL explícitamente
    sslmode: 'DISABLED' // Asegurar que SSL esté deshabilitado
  })
};

let pool;

// Mostrar configuración (sin contraseña)
console.log(`[DB] Modo: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
console.log(`[DB] Conectando a: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

async function createPool() {
  if (pool) return pool;
  
  // Mostrar configuración (sin contraseña)
  console.log(`[DB] Configuración de conexión:`);
  console.log(`[DB] - Host: ${dbConfig.host}`);
  console.log(`[DB] - Puerto: ${dbConfig.port}`);
  console.log(`[DB] - Usuario: ${dbConfig.user}`);
  console.log(`[DB] - Base de datos: ${dbConfig.database}`);
  console.log(`[DB] - SSL: ${dbConfig.ssl ? 'Habilitado' : 'Deshabilitado'}`);
  
  try {
    // Crear el pool de conexiones
    pool = mysql.createPool(dbConfig);
    
    // Probar la conexión
    const connection = await pool.getConnection();
    console.log('[DB] Conexión exitosa a la base de datos');
    connection.release();
    
    return pool;
  } catch (error) {
    console.error('[DB] Error al conectar a la base de datos:', error.message);
    throw error;
  }
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

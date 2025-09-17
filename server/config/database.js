const mysql = require('mysql2/promise');

// Parámetros desde variables de entorno
const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'bingo_virtual'
} = process.env;

let pool;

async function createPool() {
  if (pool) return pool;
  pool = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  return pool;
}

async function initDatabase() {
  const pool = await createPool();
  // Crear tablas si no existen (equivalentes MySQL)
  // usuarios
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

  // partidas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS partidas (
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
      CONSTRAINT fk_jp_partida FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE,
      UNIQUE KEY uq_usuario_partida (usuario_id, partida_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('[DB] Tablas MySQL verificadas/inicializadas');
}

// Inicializar al cargar
initDatabase().catch(err => {
  console.error('[DB] Error durante la inicialización:', err);
});

module.exports = {
  getPool: createPool
};

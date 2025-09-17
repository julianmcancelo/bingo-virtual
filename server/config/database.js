const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ruta a la base de datos (se creará automáticamente si no existe)
const dbPath = path.join(__dirname, '..', 'data', 'bingo.db');

// Crear directorio 'data' si no existe
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Conectar a la base de datos
const db = new Database(dbPath, {
  // Habilitar el modo verbose para ver las consultas SQL en consola (útil para desarrollo)
  verbose: console.log,
  // Habilitar el modo WAL para mejor rendimiento en escrituras concurrentes
  fileMustExist: false
});

// Habilitar claves foráneas
db.pragma('foreign_keys = ON');

// Crear tablas si no existen
const initDatabase = () => {
  // Tabla de usuarios
  db.prepare(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_usuario TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      contrasena TEXT NOT NULL,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Tabla de partidas
  db.prepare(`
    CREATE TABLE IF NOT EXISTS partidas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo_sala TEXT NOT NULL UNIQUE,
      estado TEXT NOT NULL DEFAULT 'esperando',
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      finalizado_en TIMESTAMP
    )
  `).run();

  // Tabla de jugadores en partidas
  db.prepare(`
    CREATE TABLE IF NOT EXISTS jugadores_partida (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      partida_id INTEGER NOT NULL,
      puntuacion INTEGER DEFAULT 0,
      gano BOOLEAN DEFAULT 0,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE,
      UNIQUE(usuario_id, partida_id)
    )
  `).run();

  console.log('Base de datos inicializada correctamente');
};

// Inicializar la base de datos
initDatabase();

// Exportar la instancia de la base de datos
module.exports = db;

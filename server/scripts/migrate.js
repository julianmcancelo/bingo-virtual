const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

// Configuración de la base de datos
const dbPath = path.join(__dirname, '..', 'data', 'bingo.db');

// Crear directorio 'data' si no existe
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  console.log(chalk.green('✓ Directorio de datos creado'));
}

// Conectar a la base de datos
console.log(chalk.blue('Conectando a la base de datos...'));
const db = new Database(dbPath);

// Habilitar claves foráneas
db.pragma('foreign_keys = ON');

// Crear tablas
console.log(chalk.blue('Creando tablas...'));

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

// Índices para mejorar el rendimiento
db.prepare('CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)').run();
db.prepare('CREATE INDEX IF NOT EXISTS idx_usuarios_nombre ON usuarios(nombre_usuario)').run();
db.prepare('CREATE INDEX IF NOT EXISTS idx_partidas_codigo ON partidas(codigo_sala)').run();

db.close();

console.log(chalk.green('✓ Migración completada exitosamente'));

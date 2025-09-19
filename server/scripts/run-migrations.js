const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Usar la misma configuración que en database.js
const {
  NODE_ENV = 'development',
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = 'tu_contraseña_mysql',
  DB_NAME = 'bingo_virtual',
  DB_SOCKET,
  DB_SSL = 'false',
  DB_SSL_REJECT_UNAUTHORIZED = 'false'
} = process.env;

console.log(`[MIGRATIONS] Ejecutando en modo: ${NODE_ENV}`);
console.log(`[MIGRATIONS] Base de datos: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

// Configuración de la base de datos
const dbConfig = {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  multipleStatements: true,
  // Configuración adicional
  connectTimeout: 10000,
  ...(DB_SOCKET && { socketPath: DB_SOCKET }),
  ...(DB_SSL === 'true' && {
    ssl: { 
      rejectUnauthorized: DB_SSL_REJECT_UNAUTHORIZED === 'true' 
    }
  })
};

async function runMigrations() {
  let connection;
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      ...dbConfig,
      multipleStatements: true
    });

    console.log('✅ Conectado a la base de datos');

    // Leer archivos de migración
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = await fs.readdir(migrationsDir);
    
    // Ordenar los archivos de migración
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📋 Encontradas ${migrationFiles.length} migraciones`);

    // Crear tabla de migraciones si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Obtener migraciones ya ejecutadas
    const [executedMigrations] = await connection.query('SELECT name FROM migrations');
    const executedMigrationNames = new Set(executedMigrations.map(m => m.name));

    // Ejecutar migraciones pendientes
    for (const file of migrationFiles) {
      if (!executedMigrationNames.has(file)) {
        console.log(`🚀 Ejecutando migración: ${file}`);
        
        const filePath = path.join(migrationsDir, file);
        const sql = await fs.readFile(filePath, 'utf8');
        
        try {
          await connection.beginTransaction();
          await connection.query(sql);
          
          // Registrar la migración
          await connection.query('INSERT INTO migrations (name) VALUES (?)', [file]);
          await connection.commit();
          
          console.log(`✅ Migración completada: ${file}`);
        } catch (error) {
          await connection.rollback();
          console.error(`❌ Error en la migración ${file}:`, error);
          process.exit(1);
        }
      } else {
        console.log(`⏭️  Saltando migración ya ejecutada: ${file}`);
      }
    }

    console.log('✨ Todas las migraciones se han ejecutado correctamente');
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar migraciones
runMigrations();

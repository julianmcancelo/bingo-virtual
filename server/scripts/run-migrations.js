const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configuración de la base de datos desde variables de entorno
const dbConfig = {
  host: process.env.DB_HOST || '167.250.5.55',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'jcancelo_aled',
  password: process.env.DB_PASSWORD || 'feelthesky1',
  database: process.env.DB_NAME || 'jcancelo_aled',
  multipleStatements: true
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

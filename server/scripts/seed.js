const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const chalk = require('chalk');

// Configuración de la base de datos
const dbPath = path.join(__dirname, '..', 'data', 'bingo.db');

// Verificar si existe la base de datos
if (!require('fs').existsSync(dbPath)) {
  console.error(chalk.red('Error: La base de datos no existe. Ejecuta primero el comando `npm run migrate`'));
  process.exit(1);
}

// Conectar a la base de datos
console.log(chalk.blue('Conectando a la base de datos...'));
const db = new Database(dbPath);

// Habilitar claves foráneas
db.pragma('foreign_keys = ON');

// Función para limpiar datos existentes
const limpiarDatos = () => {
  console.log(chalk.yellow('Limpiando datos existentes...'));
  
  // Deshabilitar temporalmente las claves foráneas
  db.pragma('foreign_keys = OFF');
  
  // Eliminar datos en el orden correcto para evitar violaciones de clave foránea
  db.prepare('DELETE FROM jugadores_partida').run();
  db.prepare('DELETE FROM partidas').run();
  db.prepare('DELETE FROM usuarios').run();
  
  // Reiniciar los contadores de autoincremento
  db.prepare('DELETE FROM sqlite_sequence WHERE name IN (\'usuarios\', \'partidas\', \'jugadores_partida\')').run();
  
  // Volver a habilitar las claves foráneas
  db.pragma('foreign_keys = ON');
  
  console.log(chalk.green('✓ Datos limpiados exitosamente'));
};

// Función para insertar usuarios de prueba
const insertarUsuarios = async () => {
  console.log(chalk.blue('Insertando usuarios de prueba...'));
  
  const usuarios = [
    {
      nombre_usuario: 'admin',
      email: 'admin@bingo.com',
      contrasena: await bcrypt.hash('admin123', 10)
    },
    {
      nombre_usuario: 'jugador1',
      email: 'jugador1@bingo.com',
      contrasena: await bcrypt.hash('jugador1', 10)
    },
    {
      nombre_usuario: 'jugador2',
      email: 'jugador2@bingo.com',
      contrasena: await bcrypt.hash('jugador2', 10)
    },
    {
      nombre_usuario: 'jugador3',
      email: 'jugador3@bingo.com',
      contrasena: await bcrypt.hash('jugador3', 10)
    }
  ];
  
  const insertarUsuario = db.prepare(
    'INSERT INTO usuarios (nombre_usuario, email, contrasena) VALUES (?, ?, ?)'
  );
  
  const insertarUsuarios = db.transaction((usuarios) => {
    for (const usuario of usuarios) {
      insertarUsuario.run(
        usuario.nombre_usuario,
        usuario.email,
        usuario.contrasena
      );
    }
  });
  
  insertarUsuarios(usuarios);
  console.log(chalk.green(`✓ ${usuarios.length} usuarios insertados exitosamente`));
};

// Función principal
const main = async () => {
  try {
    // Limpiar datos existentes
    limpiarDatos();
    
    // Insertar usuarios de prueba
    await insertarUsuarios();
    
    console.log(chalk.green('\n¡Base de datos poblada exitosamente! 🎉'));
    console.log(chalk.blue('\nUsuarios de prueba:'));
    console.log(chalk.cyan('  - admin@bingo.com / admin123 (administrador)'));
    console.log(chalk.cyan('  - jugador1@bingo.com / jugador1'));
    console.log(chalk.cyan('  - jugador2@bingo.com / jugador2'));
    console.log(chalk.cyan('  - jugador3@bingo.com / jugador3'));
    
  } catch (error) {
    console.error(chalk.red('Error al poblar la base de datos:'), error);
    process.exit(1);
  } finally {
    // Cerrar la conexión a la base de datos
    db.close();
  }
};

// Ejecutar el script principal
main();

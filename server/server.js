/**
 * SERVIDOR MULTIJUGADOR BINGO VIRTUAL EDUCATIVO
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Servidor Node.js con Socket.IO para funcionalidad multijugador del bingo virtual
 * 
 * ESTRUCTURAS DE DATOS IMPLEMENTADAS:
 * - Map: Para almacenar salas de juego (O(1) búsqueda/inserción)
 * - Set: Para números sorteados sin duplicados (O(1) verificación)
 * - Array: Para jugadores y historial de números (O(n) iteración)
 * 
 * ALGORITMOS APLICADOS:
 * - Generación de números aleatorios con validación
 * - Sincronización de estado entre múltiples clientes
 * - Manejo de eventos asíncronos con callbacks
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk');

// Importar controladores y rutas
const authController = require('./controllers/authController');
const nivelController = require('./controllers/nivelController');
const apiRoutes = require('./routes/api');

// Inicializar aplicación Express
const app = express();

// Crear servidor HTTP
const server = http.createServer(app);

// La inicialización de la base de datos ahora se maneja en config/database.js

// Configuración de middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:4200',
  'https://bingo-virtual.onrender.com',
  'https://bingo-virtual.vercel.app',
  'https://bingo-aled3.vercel.app'
];

// Configurar CORS para Express
app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    // Verificar si el origen está permitido
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política de CORS para este sitio no permite acceso desde el origen especificado.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Permitir credenciales (cookies)
}));

// Rutas de la API
app.use('/api/v', apiRoutes);

// Rutas de autenticación (mantener compatibilidad)
app.post('/api/v1/auth/registro', authController.registro);
app.post('/api/v1/auth/iniciar-sesion', authController.iniciarSesion);
app.post('/api/v1/auth/cerrar-sesion', authController.cerrarSesion);
app.post('/api/v1/auth/refresh-token', authController.proteger, authController.refrescarToken);
// Alias de versión corta /api/v/* para compatibilidad
app.post('/api/v/auth/registro', authController.registro);
app.post('/api/v/auth/iniciar-sesion', authController.iniciarSesion);
app.post('/api/v/auth/cerrar-sesion', authController.cerrarSesion);
app.post('/api/v/auth/refresh-token', authController.proteger, authController.refrescarToken);

// Ruta protegida de ejemplo
app.get('/api/v1/auth/perfil', authController.proteger, authController.obtenerPerfil);
app.patch('/api/v1/auth/actualizar-perfil', authController.proteger, authController.actualizarPerfil);
app.patch('/api/v1/auth/actualizar-contrasena', authController.proteger, authController.actualizarContrasena);
// Alias /api/v/*
app.get('/api/v/auth/perfil', authController.proteger, authController.obtenerPerfil);
app.patch('/api/v/auth/actualizar-perfil', authController.proteger, authController.actualizarPerfil);
app.patch('/api/v/auth/actualizar-contrasena', authController.proteger, authController.actualizarContrasena);

// Rutas de niveles de usuario
app.get('/api/v/niveles/mi-nivel', authController.proteger, nivelController.obtenerMiNivel);
app.get('/api/v/niveles/ranking', authController.proteger, nivelController.obtenerRanking);
app.post('/api/v/niveles/experiencia', authController.proteger, nivelController.otorgarExperiencia);

// Ruta de verificación de salud
app.get('/api/v1/salud', (req, res) => {
  res.status(200).json({
    estado: 'éxito',
    mensaje: 'El servidor está funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});
// Alias /api/v/salud
app.get('/api/v/salud', (req, res) => {
  res.status(200).json({
    estado: 'éxito',
    mensaje: 'El servidor está funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de salud de base de datos (MySQL)
const { getPool } = require('./config/database');
app.get('/api/v/db/health', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.status(200).json({ estado: 'éxito', db: 'ok', result: rows[0] });
  } catch (e) {
    res.status(500).json({ estado: 'error', mensaje: e.message });
  }
});

// Manejador de rutas no encontradas
app.all('*', (req, res, next) => {
  res.status(404).json({
    estado: 'error',
    mensaje: `No se pudo encontrar ${req.originalUrl} en este servidor`
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(chalk.red('Error:'), err);
  
  res.status(err.statusCode || 500).json({
    estado: 'error',
    mensaje: err.message || 'Algo salió mal en el servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Permite solicitudes sin 'origin' (como apps móviles o Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'La política de CORS para este sitio no permite el acceso desde el origen especificado.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

/**
 * ESTRUCTURA DE DATOS: MAP PARA SALAS DE JUEGO
 * 
 * @description Utilizamos Map para almacenamiento eficiente de salas
 * @complexity O(1) para operaciones de búsqueda, inserción y eliminación
 * @structure {
 *   salaId: {
 *     id: string,
 *     nombre: string,
 *     jugadores: Array<Jugador>,
 *     numerosSorteados: Set<number>,
 *     numeroActual: number,
 *     juegoIniciado: boolean,
 *     juegoTerminado: boolean,
 *     ganadores: Array<string>,
 *     intervalId: NodeJS.Timeout,
 *     createdAt: Date
 *   }
 * }
 */
const salas = new Map();

/**
 * ESTRUCTURA DE DATOS: JUGADOR
 * 
 * @description Representa un jugador en el sistema multijugador
 * @structure {
 *   id: string,
 *   nombre: string,
 *   socketId: string,
 *   carton: Array<Array<CeldaBingo>>,
 *   puntuacion: number,
 *   lineasCompletadas: number,
 *   tiempoConexion: Date
 * }
 */

/**
 * ALGORITMO DE GENERACIÓN DE CARTÓN DE BINGO
 * 
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @description Genera un cartón único para cada jugador siguiendo reglas del bingo
 * @param {string} jugadorId - ID único del jugador
 * @returns {Array<Array<Object>>} Matriz 5x5 con números del bingo
 * @complexity O(n²) donde n=5, para llenar la matriz
 */
/**
 * ALGORITMO DE GENERACIÓN DE CARTÓN DE BINGO ARGENTINO (9x3)
 * 
 * @description Genera un cartón único de 9x3 con 15 números.
 * @returns {Array<Array<Object>>} Matriz 3x9 con números y celdas vacías.
 */
function generarCartonArgentino() {
  let carton = Array(3).fill(null).map(() => Array(9).fill(null));
  let numerosPorColumna = Array(9).fill(0);
  let numerosPorFila = Array(3).fill(0);

  // 1. Distribuir 15 números en el cartón
  for (let i = 0; i < 15; i++) {
    let fila, col;
    do {
      fila = Math.floor(Math.random() * 3);
      col = Math.floor(Math.random() * 9);
    } while (carton[fila][col] !== null || numerosPorFila[fila] >= 5 || numerosPorColumna[col] >= 2);

    let min, max;
    if (col === 0) {
      min = 1; max = 10;  // Columna 1: 1-10
    } else if (col === 8) {
      min = 81; max = 90; // Columna 9: 81-90
    } else {
      min = (col * 10) + 1; // Columnas 2-8: 11-20, 21-30, ..., 71-80
      max = (col + 1) * 10;
    }
    let numero;
    do {
      numero = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (carton.flat().includes(numero));

    carton[fila][col] = numero;
    numerosPorFila[fila]++;
    numerosPorColumna[col]++;
  }

  // 2. Ordenar números dentro de cada columna
  for (let col = 0; col < 9; col++) {
    const colNumeros = carton.map(f => f[col]).filter(n => n !== null);
    colNumeros.sort((a, b) => a - b);
    let numIndex = 0;
    for (let fila = 0; fila < 3; fila++) {
      if (carton[fila][col] !== null) {
        carton[fila][col] = colNumeros[numIndex++];
      }
    }
  }

  // 3. Convertir a formato de objeto CeldaBingo
  return carton.map(fila => fila.map(num => ({
    numero: num,
    marcada: num === null,
    esLibre: num === null
  })));
}

function generarCartonUnico(jugadorId) {
  const carton = [];
  const rangos = [
    { min: 1, max: 15 },   // Columna B
    { min: 16, max: 30 },  // Columna I
    { min: 31, max: 45 },  // Columna N
    { min: 46, max: 60 },  // Columna G
    { min: 61, max: 75 }   // Columna O
  ];

  for (let fila = 0; fila < 5; fila++) {
    carton[fila] = [];
    for (let columna = 0; columna < 5; columna++) {
      if (fila === 2 && columna === 2) {
        // Centro libre
        carton[fila][columna] = {
          numero: 0,
          marcada: true,
          esLibre: true
        };
      } else {
        const rango = rangos[columna];
        let numero;
        let numeroExiste;
        
        // Evitar duplicados en la misma columna
        do {
          numero = Math.floor(Math.random() * (rango.max - rango.min + 1)) + rango.min;
          numeroExiste = carton.some(f => f[columna] && f[columna].numero === numero);
        } while (numeroExiste);

        carton[fila][columna] = {
          numero: numero,
          marcada: false,
          esLibre: false
        };
      }
    }
  }

  return carton;
}

/**
 * ALGORITMO DE CREACIÓN DE SALA
 * 
 * @description Crea una nueva sala de juego multijugador
 * @param {string} nombre - Nombre de la sala
 * @returns {Object} Objeto sala creado
 * @complexity O(1) para inserción en Map
 */
function crearSala(nombre) {
  const salaId = uuidv4();
  const sala = {
    id: salaId,
    nombre: nombre,
    jugadores: [],
    numerosSorteados: new Set(),
    numeroActual: null,
    juegoIniciado: false,
    juegoTerminado: false,
    ganadores: [],
    intervalId: null,
    createdAt: new Date(),
    chat: []
  };

  salas.set(salaId, sala);
  return sala;
}

/**
 * ALGORITMO DE SORTEO MULTIJUGADOR
 * 
 * @description Sortea números sincronizados para todos los jugadores de una sala
 * @param {string} salaId - ID de la sala
 * @complexity O(1) para generación, O(n) para broadcast a jugadores
 */
function sortearNumeroEnSala(salaId) {
  const sala = salas.get(salaId);
  if (!sala || sala.juegoTerminado || sala.numerosSorteados.size >= 90) {
    return;
  }

  let numero;
  do {
    numero = Math.floor(Math.random() * 90) + 1;
  } while (sala.numerosSorteados.has(numero));

  sala.numerosSorteados.add(numero);
  sala.numeroActual = numero;

  // Broadcast a todos los jugadores de la sala
  io.to(salaId).emit('numeroSorteado', {
    numero: numero,
    numerosSorteados: Array.from(sala.numerosSorteados),
    totalSorteados: sala.numerosSorteados.size
  });

  // Formatear salida con colores y emojis
  const progress = Math.round((sala.numerosSorteados.size / 90) * 100);
  const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
  
  console.log(chalk.cyan('🎱 ') + chalk.bold.white(`NÚMERO SORTEADO: `) + chalk.bold.yellow(numero));
  console.log(chalk.gray('   ├─ ') + chalk.white(`Sala: `) + chalk.green(sala.nombre));
  console.log(chalk.gray('   ├─ ') + chalk.white(`Progreso: `) + chalk.blue(`${sala.numerosSorteados.size}/90`) + chalk.gray(` (${progress}%)`));
  console.log(chalk.gray('   └─ ') + chalk.white(`[${progressBar}] `) + chalk.cyan(`${progress}%`));
  console.log('');
}

/**
 * ALGORITMO DE VERIFICACIÓN DE BINGO MULTIJUGADOR
 * 
 * @description Verifica si un jugador tiene bingo, doble línea o línea simple
 * @param {Object} carton - Cartón del jugador
 * @param {string} jugadorId - ID del jugador
 * @param {string} salaId - ID de la sala
 * @returns {Object} Resultado de la verificación con tipo de logro
 */
function verificarBingoMultijugador(carton, jugadorId, salaId) {
  const sala = salas.get(salaId);
  if (!sala) return { hayBingo: false };

  // Contar líneas completadas
  let lineasCompletadas = 0;
  const lineasGanadoras = [];

  // Verificar cada fila
  for (let i = 0; i < 3; i++) {
    const fila = carton[i];
    const numerosEnFila = fila.filter(celda => celda.numero !== null);
    if (numerosEnFila.length > 0 && numerosEnFila.every(celda => celda.marcada)) {
      lineasCompletadas++;
      lineasGanadoras.push(i + 1);
    }
  }

  // Determinar el tipo de logro
  if (lineasCompletadas === 0) {
    return { hayBingo: false };
  } else if (lineasCompletadas >= 3) {
    return { 
      hayBingo: true, 
      tipo: 'bingo', 
      lineas: lineasGanadoras,
      experiencia: 200 // Experiencia por bingo completo
    };
  } else if (lineasCompletadas === 2) {
    return { 
      hayBingo: true, 
      tipo: 'doble_linea', 
      lineas: lineasGanadoras,
      experiencia: 100 // Experiencia por doble línea
    };
  } else {
    return { 
      hayBingo: true, 
      tipo: 'linea', 
      lineas: lineasGanadoras,
      experiencia: 50 // Experiencia por línea simple
    };
  }
}

/**
 * MANEJO DE CONEXIONES WEBSOCKET
 * 
 * @description Gestiona todas las conexiones y eventos de Socket.IO
 */
io.on('connection', (socket) => {
  console.log(chalk.green('🔗 ') + chalk.bold.white('NUEVA CONEXIÓN: ') + chalk.cyan(socket.id));

  /**
   * EVENTO: Crear sala de juego
   */
  socket.on('crearSala', (data) => {
    const { nombreSala, nombreJugador } = data;

    if (!nombreJugador || nombreJugador.trim().length < 3) {
      return socket.emit('error', { mensaje: 'El nombre de jugador debe tener al menos 3 caracteres.' });
    }

    const sala = crearSala(nombreSala);
    
    const jugador = {
      id: uuidv4(),
      nombre: nombreJugador,
      socketId: socket.id,
      carton: generarCartonArgentino(),
      puntuacion: 0,
      lineasCompletadas: 0,
      tiempoConexion: new Date()
    };

    sala.jugadores.push(jugador);
    socket.join(sala.id);

    socket.emit('salaCreada', {
      sala: {
        id: sala.id,
        nombre: sala.nombre,
        jugadores: sala.jugadores.map(j => ({
          id: j.id,
          nombre: j.nombre,
          puntuacion: j.puntuacion,
          lineasCompletadas: j.lineasCompletadas
        }))
      },
      jugador: jugador
    });

    console.log(chalk.magenta('🏠 ') + chalk.bold.white('SALA CREADA: ') + chalk.yellow(nombreSala) + chalk.gray(' por ') + chalk.green(nombreJugador));
  });

  /**
   * EVENTO: Unirse a sala existente
   */
  socket.on('unirseASala', (data) => {
    const { salaId, nombreJugador } = data;
    const sala = salas.get(salaId);

    if (!sala) {
      socket.emit('error', { mensaje: 'Sala no encontrada' });
      return;
    }

        const nombreExistente = sala.jugadores.find(j => j.nombre.toLowerCase() === nombreJugador.toLowerCase());
    if (nombreExistente) {
      return socket.emit('error', { mensaje: `El nombre '${nombreJugador}' ya está en uso en esta sala.` });
    }

    if (sala.juegoIniciado) {
      socket.emit('error', { mensaje: 'El juego ya está en progreso' });
      return;
    }

    const jugador = {
      id: uuidv4(),
      nombre: nombreJugador,
      socketId: socket.id,
      carton: generarCartonArgentino(),
      puntuacion: 0,
      lineasCompletadas: 0,
      tiempoConexion: new Date()
    };

    sala.jugadores.push(jugador);
    socket.join(salaId);

    // Notificar a todos los jugadores de la sala
    io.to(salaId).emit('jugadorUnido', {
      jugador: {
        id: jugador.id,
        nombre: jugador.nombre,
        puntuacion: jugador.puntuacion,
        lineasCompletadas: jugador.lineasCompletadas
      },
      totalJugadores: sala.jugadores.length
    });

    socket.emit('unidoASala', {
      sala: {
        id: sala.id,
        nombre: sala.nombre,
        jugadores: sala.jugadores.map(j => ({
          id: j.id,
          nombre: j.nombre,
          puntuacion: j.puntuacion,
          lineasCompletadas: j.lineasCompletadas
        })),
        juegoIniciado: sala.juegoIniciado,
        numerosSorteados: Array.from(sala.numerosSorteados),
        numeroActual: sala.numeroActual
      },
      jugador: jugador
    });

    console.log(chalk.blue('👤 ') + chalk.bold.white('JUGADOR UNIDO: ') + chalk.green(nombreJugador) + chalk.gray(' → ') + chalk.yellow(sala.nombre));
  });

  /**
   * EVENTO: Iniciar juego en sala
   */
  socket.on('iniciarJuego', (data) => {
    const { salaId } = data;
    const sala = salas.get(salaId);

    if (!sala || sala.juegoIniciado) return;

    sala.juegoIniciado = true;
    sala.juegoTerminado = false;
    sala.numerosSorteados.clear();
    sala.ganadores = [];

    // Iniciar sorteo automático cada 3 segundos
    sala.intervalId = setInterval(() => {
      sortearNumeroEnSala(salaId);
    }, 3000);

    io.to(salaId).emit('juegoIniciado', {
      mensaje: '¡El juego ha comenzado!',
      jugadores: sala.jugadores.length
    });

    console.log(chalk.red('🎮 ') + chalk.bold.white('JUEGO INICIADO: ') + chalk.yellow(sala.nombre) + chalk.gray(' con ') + chalk.cyan(sala.jugadores.length) + chalk.gray(' jugadores'));
    console.log(chalk.gray('   └─ ') + chalk.white('Sorteo automático cada 3 segundos'));
  });

  /**
   * EVENTO: Marcar número en cartón
   */
  // Función para finalizar la partida y guardar estadísticas
  const finalizarPartida = async (sala, ganadorId) => {
    if (sala.partidaFinalizada) return;
    sala.partidaFinalizada = true;
    
    try {
      const pool = await require('./config/database').getPool();
      const ahora = new Date();
      const duracion = (ahora - sala.horaInicio) / 1000; // en segundos
      
      // Guardar estadísticas para cada jugador
      for (const jugador of sala.jugadores) {
        if (jugador.usuarioId) {
          const esGanador = jugador.id === ganadorId;
          
          // Insertar estadísticas de la partida
          const [result] = await pool.execute(
            `INSERT INTO partidas_estadisticas 
             (usuario_id, sala_id, puntuacion, lineas_completadas, duracion) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              jugador.usuarioId,
              sala.id,
              jugador.puntuacion || 0,
              jugador.lineasCompletadas || 0,
              duracion
            ]
          );
          
          // Registrar log de finalización
          if (esGanador) {
            await pool.execute(
              `INSERT INTO logs_partidas 
               (partida_id, tipo, mensaje, datos) 
               VALUES (?, ?, ?, ?)`,
              [
                result.insertId,
                'finalizacion',
                'Partida finalizada como ganador',
                JSON.stringify({
                  posicion: 1,
                  totalJugadores: sala.jugadores.length
                })
              ]
            );
          }
        }
      }
      
      console.log(chalk.green('🏆') + ` Estadísticas de la partida ${sala.id} guardadas correctamente`);
    } catch (error) {
      console.error('Error al guardar estadísticas de la partida:', error);
    }
  };


  // Manejar inicio de partida
  socket.on('iniciarJuego', (data) => {
    const { salaId } = data;
    const sala = salas.get(salaId);
    
    if (!sala || sala.juegoIniciado) return;
    
    sala.juegoIniciado = true;
    sala.juegoTerminado = false;
    sala.partidaFinalizada = false;
    sala.numerosSorteados.clear();
    sala.ganadores = [];
    sala.horaInicio = new Date();
    
    // Inicializar estadísticas de jugadores
    sala.jugadores.forEach(jugador => {
      jugador.puntuacion = 0;
      jugador.lineasCompletadas = 0;
    });

    // Iniciar sorteo automático cada 3 segundos
    sala.intervalId = setInterval(() => {
      sortearNumeroEnSala(salaId);
    }, 3000);

    io.to(salaId).emit('juegoIniciado', {
      mensaje: '¡El juego ha comenzado!',
      jugadores: sala.jugadores.length,
      horaInicio: sala.horaInicio
    });

    console.log(chalk.red('🎮 ') + chalk.bold.white('JUEGO INICIADO: ') + 
               chalk.yellow(sala.nombre) + 
               chalk.gray(' con ') + 
               chalk.cyan(sala.jugadores.length) + 
               chalk.gray(' jugadores'));
  });

  socket.on('marcarNumero', async (data) => {
    const { salaId, jugadorId, fila, columna, usuarioId } = data; // Asegúrate de que el cliente envíe el usuarioId
    const sala = salas.get(salaId);
    
    if (!sala || !sala.juegoIniciado || sala.juegoTerminado) return;

    const jugador = sala.jugadores.find(j => j.id === jugadorId);
    if (!jugador) return;

    // Marcar la celda
    jugador.carton[fila][columna].marcada = !jugador.carton[fila][columna].marcada;

    // Verificar bingo/líneas
    const resultadoBingo = verificarBingoMultijugador(jugador.carton, jugadorId, salaId);
    
    if (resultadoBingo.hayBingo) {
      // Actualizar estadísticas del jugador
      jugador.lineasCompletadas += resultadoBingo.lineas.length;
      jugador.puntuacion += resultadoBingo.experiencia; // Usamos la experiencia como puntuación
      
      // Solo otorgar experiencia si es la primera vez que completa este logro
      const logroUnicoKey = `${jugadorId}_${resultadoBingo.tipo}`;
      if (!sala.logrosOtorgados) sala.logrosOtorgados = new Set();
      
      if (!sala.logrosOtorgados.has(logroUnicoKey)) {
        sala.logrosOtorgados.add(logroUnicoKey);
        
        // Otorgar experiencia al jugador
        if (usuarioId) { // Solo si el jugador está autenticado
          try {
            const levelService = require('./services/levelService');
            const accion = resultadoBingo.tipo.toUpperCase();
            await levelService.otorgarExperiencia(usuarioId, accion);
            
            console.log(chalk.green('🏅') + ` ${jugador.nombre} ha ganado ` + 
              chalk.yellow(resultadoBingo.tipo.replace('_', ' ')) + 
              chalk.gray(' en ') + chalk.cyan(sala.nombre) +
              chalk.gray(` (${resultadoBingo.experiencia} XP)`));
              
          } catch (error) {
            console.error('Error al otorgar experiencia:', error);
          }
        }
      }
    }

    // Actualizar estado del jugador a todos
    io.to(salaId).emit('jugadorActualizado', {
      jugadorId: jugadorId,
      puntuacion: jugador.puntuacion,
      lineasCompletadas: jugador.lineasCompletadas
    });
  });

  /**
   * EVENTO: Enviar mensaje de chat
   */
  socket.on('enviarMensaje', (data) => {
    const { salaId, jugadorId, mensaje } = data;
    const sala = salas.get(salaId);
    
    if (!sala) return;

    // Buscar jugador por ID o por nombre (compatibilidad)
    let jugador = sala.jugadores.find(j => j.id === jugadorId);
    if (!jugador) {
      jugador = sala.jugadores.find(j => j.nombre === jugadorId);
    }
    if (!jugador) return;

    const mensajeChat = {
      id: uuidv4(),
      jugador: jugador.nombre,
      mensaje: mensaje,
      timestamp: new Date()
    };

    sala.chat.push(mensajeChat);

    io.to(salaId).emit('nuevoMensaje', mensajeChat);
  });

  /**
   * EVENTO: Obtener salas disponibles
   */
  socket.on('obtenerSalas', () => {
    const salasDisponibles = Array.from(salas.values())
      .filter(sala => !sala.juegoIniciado)
      .map(sala => ({
        id: sala.id,
        nombre: sala.nombre,
        jugadores: sala.jugadores.length,
        createdAt: sala.createdAt
      }));

    socket.emit('salasDisponibles', salasDisponibles);
  });

  /**
   * EVENTO: Desconexión de cliente
   */
  socket.on('disconnect', () => {
    console.log(chalk.red('🔌 ') + chalk.bold.white('DESCONEXIÓN: ') + chalk.gray(socket.id));
    
    // Remover jugador de todas las salas
    salas.forEach((sala, salaId) => {
      const jugadorIndex = sala.jugadores.findIndex(j => j.socketId === socket.id);
      
      if (jugadorIndex !== -1) {
        const jugador = sala.jugadores[jugadorIndex];
        sala.jugadores.splice(jugadorIndex, 1);
        
        console.log(chalk.yellow('👋 ') + chalk.bold.white('JUGADOR SALIÓ: ') + chalk.red(jugador.nombre) + chalk.gray(' de ') + chalk.yellow(sala.nombre));
        
        // Notificar a otros jugadores
        io.to(salaId).emit('jugadorDesconectado', {
          jugador: jugador.nombre,
          totalJugadores: sala.jugadores.length
        });

        // Si no quedan jugadores, eliminar la sala
        if (sala.jugadores.length === 0) {
          if (sala.intervalId) {
            clearInterval(sala.intervalId);
          }
          salas.delete(salaId);
          console.log(chalk.red('🗑️  ') + chalk.bold.white('SALA ELIMINADA: ') + chalk.yellow(sala.nombre) + chalk.gray(' - Sin jugadores'));
        }
      }
    });
  });
});

// Endpoint para estadísticas del servidor
app.get('/stats', (req, res) => {
  const stats = {
    salasActivas: salas.size,
    jugadoresConectados: Array.from(salas.values()).reduce((total, sala) => total + sala.jugadores.length, 0),
    juegosEnProgreso: Array.from(salas.values()).filter(sala => sala.juegoIniciado).length
  };
  
  res.json(stats);
});

const PORT = 3000;

const showMatrixAnimation = (callback) => {
  console.clear();
  const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
  const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  const characters = katakana + latin + nums;
  const specialWords = ['BINGO', 'ALED3', 'CANCELO', 'OTERO', 'SALDIVAR'];
  const highlightColor = chalk.bold.hex('#39FF14'); // Lime green

  let columns = Array(process.stdout.columns).fill(1);

  const stream = () => {
    process.stdout.write('\x1b[2J\x1b[H'); // Clear screen
    columns.forEach((y, index) => {
      const char = characters[Math.floor(Math.random() * characters.length)];
      const color = Math.random() > 0.9 ? chalk.white : chalk.green;
      process.stdout.cursorTo(index, y);
      process.stdout.write(color(char));

      if (y > process.stdout.rows) {
        columns[index] = 1;
      } else {
        columns[index] = y + 1;
      }
    });
    // Inject special words
    if (Math.random() > 0.95) {
      const word = specialWords[Math.floor(Math.random() * specialWords.length)];
      const x = Math.floor(Math.random() * (process.stdout.columns - word.length));
      const y = Math.floor(Math.random() * process.stdout.rows);
      process.stdout.cursorTo(x, y);
      process.stdout.write(highlightColor(word));
    }
  };

  const animation = setInterval(stream, 80);

  setTimeout(() => {
    clearInterval(animation);
    console.clear();
    callback();
  }, 5000); // Duración de la animación: 5 segundos
};

const startServer = () => {
  const width = 80;
  const border = chalk.hex('#888')('─').repeat(width);
  const title = (text) => chalk.bold.hex('#FFA500')(text.toUpperCase());

  const logo = [
    chalk.cyan('    ██████╗  ██╗ ███╗   ██╗  ██████╗  ██████╗'),
    chalk.cyan('    ██╔══██╗ ██║ ████╗  ██║ ██╔════╝ ██╔═══██╗'),
    chalk.cyan('    ██████╔╝ ██║ ██╔██╗ ██║ ██║  ███╗ ██║   ██║'),
    chalk.cyan('    ██╔══██╗ ██║ ██║╚██╗██║ ██║   ██║ ██║   ██║'),
    chalk.cyan('    ██████╔╝ ██║ ██║ ╚████║ ╚██████╔╝ ╚██████╔╝'),
    chalk.cyan('    ╚═════╝  ╚═╝ ╚═╝  ╚═══╝  ╚═════╝   ╚═════╝'),
  ].join('\n');

  console.log(logo);
  console.log(border);

  // Proyecto y Equipo
  console.log(title('  Proyecto'));
  console.log(`    ${chalk.white('Materia:')} ${chalk.yellow('Algoritmos y Estructuras de Datos III')}`);
  console.log(`    ${chalk.white('Profesor:')} ${chalk.yellow('Sebastián Saldivar')}`);
  console.log(`    ${chalk.white('Autores:')} ${chalk.yellow('Julián M. Cancelo & Nicolás Otero')}`);
  console.log(border);

  // Detalles Técnicos
  console.log(title('  Detalles Técnicos del Servidor'));
  console.log(`    ${chalk.hex('#00FFFF')('Estructuras de Datos:')}`);
  console.log(`      - ${chalk.white('Map:')} Almacenamiento de salas de juego ${chalk.gray('(O(1) Búsqueda/Inserción)')}`);
  console.log(`      - ${chalk.white('Set:')} Números sorteados sin duplicados ${chalk.gray('(O(1) Verificación)')}`);
  console.log(`    ${chalk.hex('#00FFFF')('Algoritmos Clave:')}`);
  console.log(`      - ${chalk.white('Sincronización de Estado en Tiempo Real con WebSockets')}`);
  console.log(`      - ${chalk.white('Generación de Cartones de Bingo Únicos')}`);
  console.log(border);

  // Estado del Servidor
  console.log(title('  Estado del Servidor'));
  console.log(`    ${chalk.green('●')} ${chalk.white('Servidor escuchando en el puerto')} ${chalk.bold.yellow(PORT)}`);
  console.log(`    ${chalk.green('●')} ${chalk.white('Socket.IO listo para recibir conexiones.')}`);
  console.log(border);
};

server.listen(PORT, () => {
  if (process.stdout.isTTY) {
    showMatrixAnimation(startServer);
  } else {
    startServer();
  }
  });

module.exports = { app, server, io };

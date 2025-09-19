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
const apiRoutes = require('./routes/api');
const authController = require('./controllers/authController');
const nivelController = require('./controllers/nivelController');

// Inicializar aplicación Express
const app = express();

// Crear servidor HTTP
const server = http.createServer(app);

// La inicialización de la base de datos ahora se maneja en config/database.js

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:4200',
  'https://bingo-virtual.onrender.com',
  'https://bingo-virtual.vercel.app',
  'https://bingo-aled3.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:4200',
  'http://localhost:8080',
  'http://localhost:5173'  // Vite
];

// Configuración de CORS para Express
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) {
      console.log('Solicitud sin origen (origen nulo)');
      return callback(null, true);
    }
    
    console.log('Verificando origen CORS:', origin);
    
    // Verificar si el origen está en la lista blanca (comparación simple)
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Normalizar las URLs para comparación
      const normalizedOrigin = origin.replace(/\/$/, '');
      const normalizedAllowed = allowedOrigin.replace(/\/$/, '');
      return normalizedOrigin === normalizedAllowed || 
             normalizedOrigin.startsWith(normalizedAllowed);
    });

    if (isAllowed) {
      console.log('Origen permitido:', origin);
      return callback(null, true);
    } else {
      console.warn('CORS bloqueado para origen no permitido:', origin);
      console.log('Orígenes permitidos:', allowedOrigins);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'x-access-token',
    'Access-Control-Allow-Origin',
    'Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400 // 24 horas de caché para preflight
};

// Configuración de middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilitar preflight para todas las rutas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de archivos estáticos
const publicPath = path.join(__dirname, '..', 'public');
const avatarsPath = path.join(publicPath, 'avatars');

// Asegurarse de que existan los directorios
[publicPath, avatarsPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directorio creado: ${dir}`);
  }
});

// Servir archivos estáticos desde la carpeta public
app.use(express.static(publicPath));

// Ruta específica para los avatares
app.use('/uploads/avatars', express.static(avatarsPath, {
  setHeaders: (res, path) => {
    // Permitir el acceso a los archivos estáticos desde cualquier origen
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

console.log('Rutas estáticas configuradas:');
console.log(`- /uploads/avatars -> ${avatarsPath}`);

// Configuración de rutas API
app.use('/api/v', apiRoutes);

// Middleware para log de headers
app.use((req, res, next) => {
  console.log('Headers recibidos:', req.headers);
  console.log('Método:', req.method);
  console.log('URL:', req.originalUrl);
  next();
});

// Aplicar CORS a todas las rutas
app.use(cors(corsOptions));

// Manejar preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Middleware para agregar headers CORS manualmente
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Responder inmediatamente a las solicitudes OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Importar rutas de autenticación
const authRoutes = require('./routes/auth');

// Rutas de autenticación (versión 1)
app.use('/api/v1/auth', authRoutes);

// Alias de versión corta /api/v/auth para compatibilidad
app.use('/api/v/auth', authRoutes);

// Manejador para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

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

// Configuración de Socket.IO con CORS
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
      if (!origin) return callback(null, true);
      
      // Verificar si el origen está en la lista blanca
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        const normalizedOrigin = origin.replace(/\/$/, '');
        const normalizedAllowed = allowedOrigin.replace(/\/$/, '');
        return normalizedOrigin === normalizedAllowed || 
               normalizedOrigin.startsWith(normalizedAllowed);
      });
      
      callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'Accept', 
      'x-access-token'
    ],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
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
    try {
      const ahora = new Date();
      const duracion = Math.round((ahora - new Date(sala.horaInicio)) / 1000); // Duración en segundos
      
      // Preparar datos para el controlador de estadísticas
      const gameStats = {
        gameId: sala.id,
        startTime: sala.horaInicio,
        endTime: ahora,
        duration: duracion,
        players: sala.jugadores
          .filter(jugador => jugador.usuarioId) // Solo jugadores autenticados
          .map(jugador => ({
            userId: jugador.usuarioId,
            score: jugador.puntuacion || 0,
            linesCompleted: jugador.lineasCompletadas || 0,
            isWinner: jugador.id === ganadorId,
            logs: jugador.id === ganadorId ? [{
              type: 'finalizacion',
              message: 'Partida finalizada como ganador',
              data: {
                posicion: 1,
                totalJugadores: sala.jugadores.length
              },
              timestamp: ahora
            }] : []
          }))
      };
      
      // Llamar al controlador de estadísticas
      const { guardarEstadisticas } = require('./controllers/statsController');
      const req = { body: gameStats };
      const res = {
        status: (code) => ({
          json: (data) => {
            if (code >= 200 && code < 300) {
              console.log(chalk.green('🏆') + ` Estadísticas de la partida ${sala.id} guardadas correctamente`);
            } else {
              console.error(chalk.red('❌') + ` Error al guardar estadísticas: ${data.mensaje || 'Error desconocido'}`);
            }
          }
        })
      };
      
      await guardarEstadisticas(req, res);
      
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

    // Guardar el usuarioId en el objeto jugador para usarlo al finalizar la partida
    if (usuarioId && !jugador.usuarioId) {
      jugador.usuarioId = usuarioId;
    }

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
            
            // Si es un bingo completo, finalizar la partida
            if (resultadoBingo.tipo === 'bingo' && !sala.juegoTerminado) {
              sala.juegoTerminado = true;
              
              // Detener el sorteo automático
              if (sala.intervalId) {
                clearInterval(sala.intervalId);
                sala.intervalId = null;
              }
              
              // Guardar estadísticas de la partida
              await finalizarPartida(sala, jugadorId);
              
              // Notificar a todos los jugadores que la partida ha terminado
              io.to(salaId).emit('partidaTerminada', {
                ganador: {
                  id: jugador.id,
                  nombre: jugador.nombre,
                  puntuacion: jugador.puntuacion,
                  lineasCompletadas: jugador.lineasCompletadas
                },
                tipoGanador: 'bingo',
                mensaje: `¡${jugador.nombre} ha cantado BINGO!`
              });
            }
              
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
      lineasCompletadas: jugador.lineasCompletadas,
      esGanador: resultadoBingo.hayBingo && resultadoBingo.tipo === 'bingo'
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

const showLoadingAnimation = (callback) => {
  console.clear();
  
  // Colores personalizados
  const colors = {
    title: chalk.hex('#4CAF50').bold,
    subtitle: chalk.hex('#81C784'),
    progress: chalk.hex('#4CAF50'),
    info: chalk.hex('#81C784'),
    success: chalk.hex('#4CAF50').bold,
    highlight: chalk.hex('#FFD700').bold
  };

  // Mensaje de bienvenida
  const title = 'BINGO VIRTUAL EDUCATIVO';
  const subtitle = 'Servidor de Juego Multijugador';
  const padding = Math.floor((process.stdout.columns - title.length) / 2);
  
  console.log('\n'.repeat(2));
  console.log(' '.repeat(padding) + colors.title(title));
  console.log(' '.repeat(Math.floor((process.stdout.columns - subtitle.length) / 2)) + colors.subtitle(subtitle));
  console.log('\n'.repeat(2));
  
  // Información del sistema
  const systemInfo = [
    `Versión: ${process.version}`,
    `Plataforma: ${process.platform} ${process.arch}`,
    `Directorio: ${process.cwd()}`,
    `Modo: ${process.env.NODE_ENV || 'development'}`
  ];
  
  systemInfo.forEach((info, i) => {
    console.log(colors.info('  ' + info));
  });
  
  console.log('\n' + ' '.repeat(5) + 'Iniciando servidor...\n');
  
  // Barra de progreso
  const progressBarLength = process.stdout.columns - 30;
  let progress = 0;
  
  const updateProgress = () => {
    const filled = Math.round(progressBarLength * (progress / 100));
    const empty = progressBarLength - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    process.stdout.cursorTo(10, systemInfo.length + 8);
    process.stdout.clearLine(1);
    process.stdout.write(colors.progress(`  [${bar}] ${progress}%`));
    
    if (progress >= 100) {
      clearInterval(interval);
      process.stdout.write(' ' + colors.success('¡Listo!\n\n'));
      setTimeout(() => {
        console.clear();
        callback();
      }, 500);
    }
    
    progress += Math.floor(Math.random() * 5) + 1;
    if (progress > 100) progress = 100;
  };
  
  const interval = setInterval(updateProgress, 50);
  updateProgress();
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
    showLoadingAnimation(startServer);
  } else {
    startServer();
  }
  });

module.exports = { app, server, io };

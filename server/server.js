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

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk');

const app = express();
const server = http.createServer(app);

// Configuración CORS para permitir conexiones desde Angular
const allowedOrigins = ['https://bingo-aled3.vercel.app'];

if (process.env.FRONTEND_URL) {
  // Eliminar la barra final si existe para evitar errores de CORS
  const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
  allowedOrigins.push(frontendUrl);
}

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

    const min = col * 10 + (col === 0 ? 1 : 0);
    const max = col * 10 + 9 + (col === 8 ? 1 : 0);
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
  if (!sala || sala.juegoTerminado || sala.numerosSorteados.size >= 75) {
    return;
  }

  let numero;
  do {
    numero = Math.floor(Math.random() * 75) + 1;
  } while (sala.numerosSorteados.has(numero));

  sala.numerosSorteados.add(numero);
  sala.numeroActual = numero;

  // Broadcast a todos los jugadores de la sala
  io.to(salaId).emit('numeroSorteado', {
    numero: numero,
    numerosSorteados: Array.from(sala.numerosSorteados),
    totalSorteados: sala.numerosSorteados.size
  });

  console.log(`[SALA ${sala.nombre}] Número sorteado: ${numero} (Total: ${sala.numerosSorteados.size}/75)`);
}

/**
 * ALGORITMO DE VERIFICACIÓN DE BINGO MULTIJUGADOR
 * 
 * @description Verifica si un jugador tiene bingo y notifica a la sala
 * @param {Object} carton - Cartón del jugador
 * @param {string} jugadorId - ID del jugador
 * @param {string} salaId - ID de la sala
 * @returns {Object} Resultado de la verificación
 */
function verificarBingoMultijugador(carton, jugadorId, salaId) {
  const sala = salas.get(salaId);
  if (!sala) return { hayBingo: false };

  // Para el bingo argentino, verificamos si se completó una línea (fila)
  for (let i = 0; i < 3; i++) {
    // Una fila gana si todas sus celdas con número están marcadas
    const fila = carton[i];
    const numerosEnFila = fila.filter(celda => celda.numero !== null);
    if (numerosEnFila.length > 0 && numerosEnFila.every(celda => celda.marcada)) {
      return { hayBingo: true, tipo: 'linea', linea: i + 1 };
    }
  }

  return { hayBingo: false };
}

/**
 * MANEJO DE CONEXIONES WEBSOCKET
 * 
 * @description Gestiona todas las conexiones y eventos de Socket.IO
 */
io.on('connection', (socket) => {
  console.log(`[CONEXIÓN] Nuevo cliente conectado: ${socket.id}`);

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

    console.log(`[SALA CREADA] ${nombreSala} por ${nombreJugador}`);
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

    console.log(`[JUGADOR UNIDO] ${nombreJugador} se unió a ${sala.nombre}`);
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

    console.log(`[JUEGO INICIADO] Sala: ${sala.nombre} con ${sala.jugadores.length} jugadores`);
  });

  /**
   * EVENTO: Marcar número en cartón
   */
  socket.on('marcarNumero', (data) => {
    const { salaId, jugadorId, fila, columna } = data;
    const sala = salas.get(salaId);
    
    if (!sala) return;

    const jugador = sala.jugadores.find(j => j.id === jugadorId);
    if (!jugador) return;

    // Marcar la celda
    jugador.carton[fila][columna].marcada = !jugador.carton[fila][columna].marcada;

    // Verificar bingo
    const resultadoBingo = verificarBingoMultijugador(jugador.carton, jugadorId, salaId);
    
    if (resultadoBingo.hayBingo) {
      jugador.lineasCompletadas++;
      jugador.puntuacion += 100;
      
      if (!sala.ganadores.includes(jugadorId)) {
        sala.ganadores.push(jugadorId);
        
        // Notificar bingo a toda la sala
        io.to(salaId).emit('bingo', {
          jugador: jugador.nombre,
          tipo: resultadoBingo.tipo,
          linea: resultadoBingo.linea,
          esGanador: sala.ganadores.length === 1
        });

        console.log(`[BINGO] ${jugador.nombre} completó ${resultadoBingo.tipo} en sala ${sala.nombre}`);
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

    const jugador = sala.jugadores.find(j => j.id === jugadorId);
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
    console.log(`[DESCONEXIÓN] Cliente desconectado: ${socket.id}`);
    
    // Remover jugador de todas las salas
    salas.forEach((sala, salaId) => {
      const jugadorIndex = sala.jugadores.findIndex(j => j.socketId === socket.id);
      
      if (jugadorIndex !== -1) {
        const jugador = sala.jugadores[jugadorIndex];
        sala.jugadores.splice(jugadorIndex, 1);
        
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
          console.log(`[SALA ELIMINADA] ${sala.nombre} - Sin jugadores`);
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

const PORT = 3002;

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

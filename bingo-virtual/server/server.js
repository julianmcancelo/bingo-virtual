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
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk');

const app = express();
const server = http.createServer(app);

// Configuración CORS para permitir conexiones desde Angular
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
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

  // Verificar filas
  for (let i = 0; i < 5; i++) {
    if (carton[i].every(celda => celda.marcada)) {
      return { hayBingo: true, tipo: 'fila', linea: i };
    }
  }

  // Verificar columnas
  for (let j = 0; j < 5; j++) {
    if (carton.every(fila => fila[j].marcada)) {
      return { hayBingo: true, tipo: 'columna', linea: j };
    }
  }

  // Verificar diagonal principal
  if (carton.every((fila, i) => fila[i].marcada)) {
    return { hayBingo: true, tipo: 'diagonal', linea: 'principal' };
  }

  // Verificar diagonal secundaria
  if (carton.every((fila, i) => fila[4 - i].marcada)) {
    return { hayBingo: true, tipo: 'diagonal', linea: 'secundaria' };
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
    const sala = crearSala(nombreSala);
    
    const jugador = {
      id: uuidv4(),
      nombre: nombreJugador,
      socketId: socket.id,
      carton: generarCartonUnico(socket.id),
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

    if (sala.juegoIniciado) {
      socket.emit('error', { mensaje: 'El juego ya está en progreso' });
      return;
    }

    const jugador = {
      id: uuidv4(),
      nombre: nombreJugador,
      socketId: socket.id,
      carton: generarCartonUnico(socket.id),
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

const PORT = process.env.PORT || 3000;

const showMatrixAnimation = (callback) => {
  console.clear();
  const characters = '01';
  const specialWords = ['BINGO', 'ALED3', 'CANCELO', 'OTERO', 'SALDIVAR'];
  const colors = [chalk.green, chalk.bold.green, chalk.hex('#008F11')];
  const highlightColor = chalk.bold.white;

  const stream = () => {
    let line = '';
    for (let i = 0; i < process.stdout.columns; i++) {
        if (Math.random() > 0.992 && i + 10 < process.stdout.columns) {
            const word = specialWords[Math.floor(Math.random() * specialWords.length)];
            line += highlightColor(word);
            i += word.length -1;
        } else {
            const char = characters[Math.floor(Math.random() * characters.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];
            line += color(char);
        }
    }
    console.log(line.substring(0, process.stdout.columns));
  };

  const animation = setInterval(stream, 75);

  setTimeout(() => {
    clearInterval(animation);
    console.clear();
    callback();
  }, 4000); // Duración de la animación: 4 segundos
};

server.listen(PORT, () => {
  showMatrixAnimation(() => {
  const border = chalk.bold.hex('#8A2BE2')('═').repeat(60);
  const emptyLine = chalk.bold.hex('#8A2BE2')('║') + ' '.repeat(58) + chalk.bold.hex('#8A2BE2')('║');

  const line = (text) => {
    const strippedText = text.replace(/[\u001b\u009b][[()#;?]*.{0,2}m/g, '');
    const padding = ' '.repeat(Math.max(0, 57 - strippedText.length));
    return chalk.bold.hex('#8A2BE2')('║ ') + text + padding + chalk.bold.hex('#8A2BE2')(' ║');
  };

  console.log(chalk.bold.hex('#8A2BE2')('\n╔' + border + '╗'));
  console.log(line(chalk.hex('#FFD700').bold('           BINGO VIRTUAL MULTIJUGADOR')));
  console.log(line(chalk.hex('#00FFFF').bold('                 SERVIDOR INICIADO')));
  console.log(chalk.bold.hex('#8A2BE2')('╠' + border + '╣'));
  console.log(line(chalk.white('Autores: Julián Manuel Cancelo & Nicolás Otero')));
  console.log(line(chalk.white('Materia: Algoritmos y Estructuras de Datos III')));
  console.log(line(chalk.white('Profesor: Sebastián Saldivar')));
  console.log(emptyLine);
  console.log(line(`${chalk.green('● Puerto:')} ${chalk.yellow(PORT)}`));
  console.log(line(`${chalk.green('● Socket.IO:')} ${chalk.yellow('Activo')}`));
  console.log(line(`${chalk.green('● CORS:')} ${chalk.yellow('http://localhost:4200')}`));
  console.log(chalk.bold.hex('#8A2BE2')('╚' + border + '╝\n'));
  });
});

module.exports = { app, server, io };

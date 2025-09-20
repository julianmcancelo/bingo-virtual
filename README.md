# 🎯 Bingo Virtual Educativo - ALED3

## 📚 Información Académica

**Instituto:** Instituto Tecnológico Beltrán (ITB)  
**Ubicación:** Av. Belgrano 1191, Avellaneda – Buenos Aires – Argentina  
**Contacto:** (+54.11) 4265.0247 / 4265.0342 / 4203.0134  
**Email:** informes@ibeltran.com.ar  
**Web:** www.ibeltran.com.ar  
**Materia:** Algoritmos y Estructuras de Datos III (ALED3)  
**Profesor:** Sebastián Saldivar  
**Año Académico:** 2025  

## 👥 Autores del Proyecto

- **Julián Manuel Cancelo** - Estudiante de Tecnicatura en Sistemas - ITB  
  📧 juliancancelo@gmail.com
- **Nicolás Otero** - Estudiante de Tecnicatura en Sistemas - ITB  
  📧 nicolasotero@gmail.com

## 🎮 Descripción del Proyecto

Aplicación web interactiva de bingo multijugador desarrollada como **trabajo final** para la materia ALED3. El proyecto implementa patrones de diseño avanzados, algoritmos de estructuras de datos complejas y comunicación en tiempo real mediante WebSockets.

### 🎯 Objetivos Académicos

- ✅ **Implementación de Estructuras de Datos:** Arrays multidimensionales, colas, pilas, y estructuras personalizadas
- ✅ **Algoritmos de Búsqueda y Ordenamiento:** Búsqueda lineal, filtrado avanzado, ordenamiento de estadísticas
- ✅ **Patrones de Diseño:** Singleton, Observer, Factory, Strategy aplicados en contexto real
- ✅ **Análisis de Complejidad:** Documentación detallada de complejidad temporal y espacial

## 🏗️ Arquitectura y Patrones Implementados

### ✅ Requisitos Obligatorios Cumplidos

- **✅ Componentes Standalone** - Todos los componentes utilizan la nueva sintaxis standalone de Angular 17
- **✅ Pipes y Directivas Personalizadas** - SearchFilterPipe, SortPipe, HighlightDirective, AutoFocusDirective
- **✅ Servicios** - SocketService, AuthService, HttpService, SettingsService
- **✅ Ruteo con Lazy Loading** - Implementado con loadComponent() y loadChildren()

---

## 3. Estructuras de Datos Implementadas

### 3.1 Arrays Multidimensionales
- **Uso:** Representación del cartón de bingo (5x5)
- **Complejidad:** O(1) para acceso a posiciones específicas
- **Implementación:** Array bidimensional para estados de celdas

### 3.2 Map (HashMap)
- **Uso:** Gestión eficiente de salas de juego y usuarios
- **Complejidad:** O(1) para operaciones de búsqueda e inserción
- **Beneficios:** Eliminación de duplicados automática

### 3.3 Set
- **Uso:** Control de números únicos en el juego
- **Complejidad:** O(1) para verificación de existencia
- **Implementación:** Números extraídos del bombo virtual

### 3.4 Queue (Cola)
- **Uso:** Gestión de turnos y orden de jugadores
- **Complejidad:** O(1) para enqueue/dequeue
- **Aplicación:** Sistema de espera para salas llenas

---

## 4. Algoritmos Implementados

### 4.1 Algoritmo de Aleatorización (Fisher-Yates)
```typescript
// Implementación del algoritmo Fisher-Yates para barajar
private shuffleArray(array: number[]): number[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
```

**Complejidad:** O(n) - lineal respecto al tamaño del array
**Uso:** Generación de números aleatorios para el bingo

### 4.2 Verificación de Patrones Ganadores
```typescript
// Verificación de línea, columna y diagonales
private checkWinPatterns(card: boolean[][]): boolean {
  // Verificar líneas horizontales
  for (let i = 0; i < 5; i++) {
    if (this.checkLine(card[i])) return true;
  }
  
  // Verificar columnas verticales
  for (let j = 0; j < 5; j++) {
    if (this.checkColumn(card, j)) return true;
  }
  
  return false;
}
```

**Complejidad:** O(1) para cada patrón verificado
**Optimización:** Early termination al encontrar patrón ganador

### 4.3 Algoritmo de Búsqueda con Early Termination
```typescript
// Búsqueda optimizada con terminación temprana
private findNumberInCard(card: number[][], target: number): boolean {
  for (let i = 0; i < card.length; i++) {
    for (let j = 0; j < card[i].length; j++) {
      if (card[i][j] === target) {
        return true; // Early termination
      }
    }
  }
  return false;
}
```

---

## 5. Patrones de Diseño Implementados

### 5.1 Singleton
- **Uso:** Gestión única de la instancia del juego
- **Implementación:** Socket.IO service como singleton
- **Beneficio:** Estado global consistente

### 5.2 Observer
- **Uso:** Notificación de cambios en tiempo real
- **Implementación:** Comunicación entre componentes
- **Beneficio:** Actualización automática de la UI

### 5.3 Factory
- **Uso:** Creación de diferentes tipos de salas
- **Implementación:** Factory para instancias de juego
- **Beneficio:** Encapsulación de lógica de creación

### 5.4 Strategy
- **Uso:** Diferentes algoritmos de validación
- **Implementación:** Estrategias intercambiables
- **Beneficio:** Flexibilidad y mantenibilidad

---

## 6. Funcionalidades Principales

### 6.1 Sistema Multijugador
- Comunicación en tiempo real mediante WebSockets
- Sincronización de estado entre múltiples jugadores
- Gestión de salas con capacidad limitada
- Actualización instantánea de cartones

### 6.2 Gestión de Usuarios
- Sistema de autenticación JWT seguro
- Perfiles de usuario con estadísticas
- Ranking de jugadores por rendimiento
- Historial de partidas jugadas

### 6.3 Análisis de Rendimiento
- Métricas de tiempo de respuesta
- Estadísticas de victorias/derrotas
- Análisis de algoritmos implementados
- Reportes de uso del sistema

---

## 7. Arquitectura del Sistema

### 7.1 Frontend (Angular 18)
```
Componentes principales:
├── WelcomeComponent (Página de inicio)
├── BingoGameComponent (Juego principal)
├── AuthComponent (Autenticación)
├── AboutComponent (Documentación)
├── AdminComponent (Panel administrativo)
└── Shared (Componentes reutilizables)
```

### 7.2 Backend (Node.js + Express)
```
Servicios principales:
├── Socket Service (WebSockets)
├── Game Service (Lógica del juego)
├── Auth Service (Autenticación)
├── Stats Service (Estadísticas)
└── User Service (Gestión de usuarios)
```

### 7.3 Base de Datos
- **LocalStorage** para estado del cliente
- **Session Storage** para datos temporales
- **Memoria del servidor** para estado compartido

---

## 8. Objetivos Académicos Cumplidos

### 8.1 Estructuras de Datos
Arrays multidimensionales para cartones de bingo
Maps para gestión eficiente de usuarios/salas
Sets para control de números únicos
Colas para gestión de turnos

### 8.2 Algoritmos
Algoritmo de aleatorización Fisher-Yates
Algoritmos de búsqueda con early termination
Algoritmos de verificación de patrones
Análisis de complejidad documentado

### 8.3 Patrones de Diseño
Singleton para estado global
Observer para comunicación reactiva
Factory para creación de instancias
Strategy para algoritmos intercambiables

### 8.4 Tecnologías Modernas
Angular 18 con componentes standalone
TypeScript en frontend y backend
WebSockets para tiempo real
Programación reactiva con RxJS

---

## 9. Conclusión

**Bingo Virtual** representa una implementación completa y profesional de un sistema multijugador en tiempo real que demuestra el dominio de conceptos avanzados de algoritmos y estructuras de datos. El proyecto cumple con todos los objetivos académicos propuestos y sirve como ejemplo práctico de aplicación de técnicas avanzadas de programación en un contexto real.

**Palabras clave:** Algoritmos, Estructuras de Datos, Patrones de Diseño, Angular, Node.js, WebSockets, Tiempo Real, Multijugador

---

## 10. Referencias Técnicas

- **Complejidad Algorítmica:** Análisis O(1) para operaciones críticas
- **Patrones de Diseño:** Implementación de 4 patrones fundamentales
- **Arquitectura:** Full-stack moderno y escalable
- **Tiempo Real:** Sincronización instantánea con Socket.IO
- **Responsive Design:** Adaptable a todos los dispositivos

**Estado del Proyecto:** Completado y funcionales (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

## Deployment
```bash
# Clonar repositorio
git clone [URL_DEL_REPOSITORIO]
cd Aledprueba

# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd server
npm install
cd ..

# Ejecutar frontend y backend simultáneamente
npm run dev

# O ejecutar por separado:
# Frontend (puerto 4200)
npm start

# Backend (puerto 3000)
npm run server
```

**Nota:** El proyecto está configurado para despliegue automático en Vercel. Las variables de entorno requeridas están documentadas en el archivo `.env.example`.
### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy carpeta dist/
```

### Backend (Render/Railway)
```bash
# El backend está configurado para deployment automático
# Variables de entorno requeridas:
# - PORT=3000
# - NODE_ENV=production
```

## 🤝 Contribución

Este proyecto fue desarrollado como trabajo académico para ALED3. Las contribuciones están limitadas a los autores del proyecto.

## 📄 Licencia

Proyecto académico - Uso educativo únicamente.

## 👥 Autores

- **Julián Manuel Cancelo** - Desarrollo Full Stack, Algoritmos
- **Nicolás Otero** - Desarrollo Full Stack, Estructuras de Datos

---

**Profesor:** Sebastián Saldivar  
**Institución:** Tecnicatura Superior en Análisis de Sistemas  
**Año:** 2025

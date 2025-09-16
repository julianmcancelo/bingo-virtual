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
- **✅ Modularización** - Estructura organizada en carpetas core/, shared/, features/
- **✅ Angular Material** - UI completa con Material Design
- **✅ Formularios Reactivos** - FormBuilder, Validators, validaciones personalizadas
- **✅ Servicios HTTP** - HttpClient con interceptores y manejo de errores
- **✅ Programación Reactiva (RxJS)** - BehaviorSubject, Observables, operadores
- **✅ Control de Versiones** - Git/GitHub con commits descriptivos
- **✅ Algoritmos y Estructuras de Datos** - Implementados en el contexto del bingo

### 🧠 Algoritmos y Estructuras de Datos Implementadas

#### Estructuras de Datos
- **Set<number>** - Números sorteados (búsqueda O(1))
- **Map<string, Usuario>** - Cache de usuarios por ID (acceso O(1))
- **Array<CeldaBingo[][]>** - Representación de cartones de bingo
- **BehaviorSubject** - Estado reactivo de la aplicación
- **Queue** - Cola de números para sortear

#### Algoritmos de Búsqueda
- **Búsqueda Lineal** - O(n) para filtrar jugadores y salas
- **Búsqueda por Hash** - O(1) para verificar números sorteados
- **Búsqueda con Normalización** - Filtros de texto insensibles a acentos

#### Algoritmos de Ordenamiento
- **Timsort** - O(n log n) para rankings y estadísticas
- **Ordenamiento por Múltiples Criterios** - Puntuación, tiempo, alfabético
- **Ordenamiento Natural** - Números y fechas

#### Complejidad Temporal Documentada
Cada función incluye documentación JSDoc con análisis de complejidad:
```typescript
/**
 * VERIFICAR BINGO COMPLETO
 * @complexity O(1) - Verificación de 25 elementos constante
 */
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+
- Angular CLI 17+
- Git

### Instalación
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
```

### Ejecución en Desarrollo
```bash
# Ejecutar frontend y backend simultáneamente
npm run dev

# O ejecutar por separado:
# Frontend (puerto 4200)
npm start

# Backend (puerto 3000)
npm run server
```

### Ejecución en Producción
```bash
# Build de producción
npm run build

# Servir aplicación
npm run serve:ssr:bingo-virtual
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios centrales y guards
│   │   ├── guards/
│   │   │   └── auth.guard.ts    # Protección de rutas
│   │   └── services/
│   │       ├── auth.service.ts  # Autenticación y roles
│   │       └── http.service.ts  # Cliente HTTP centralizado
│   ├── shared/                  # Componentes y utilidades compartidas
│   │   ├── pipes/
│   │   │   ├── search-filter.pipe.ts  # Filtrado O(n*m)
│   │   │   └── sort.pipe.ts           # Ordenamiento O(n log n)
│   │   └── directives/
│   │       ├── highlight.directive.ts  # Resaltado interactivo
│   │       └── auto-focus.directive.ts # Enfoque automático
│   ├── features/                # Módulos de funcionalidades
│   │   ├── auth/               # Autenticación (Lazy Loading)
│   │   ├── bingo/              # Lógica del bingo
│   │   ├── estadisticas/       # Rankings y estadísticas
│   │   └── admin/              # Panel de administración
│   ├── components/             # Componentes del bingo
│   │   ├── login/              # Formularios reactivos
│   │   ├── lobby/              # Gestión de salas
│   │   ├── sala/               # Sala de espera
│   │   ├── juego/              # Partida en curso
│   │   └── carton-bingo/       # Cartón interactivo
│   └── services/
│       ├── socket.service.ts   # WebSocket multijugador
│       └── settings.service.ts # Configuración del juego
├── environments/               # Configuración por entorno
└── assets/                    # Recursos estáticos
```

## 🎯 Funcionalidades Principales

### 🔐 Sistema de Autenticación
- Login como invitado (implementado)
- Autenticación con roles (admin, moderator, player)
- Guards para protección de rutas
- Persistencia de sesión en localStorage

### 🎮 Juego de Bingo
- Generación automática de cartones únicos
- Multijugador en tiempo real con Socket.IO
- Validación automática de líneas y bingo completo
- Narrador de números con síntesis de voz
- Marcado automático opcional

### 📊 Estadísticas y Rankings
- Historial de partidas por jugador
- Rankings con algoritmos de ordenamiento
- Filtros avanzados con búsqueda optimizada
- Análisis de rendimiento y estadísticas

### 🛠️ Panel de Administración
- Gestión de salas activas
- Moderación de usuarios
- Configuración del servidor
- Monitoreo en tiempo real

## 🔧 Tecnologías Utilizadas

### Frontend
- **Angular 17** - Framework principal con standalone components
- **Angular Material** - UI/UX components
- **RxJS** - Programación reactiva
- **Tailwind CSS** - Estilos utilitarios
- **SweetAlert2** - Modales y notificaciones
- **TypeScript** - Tipado fuerte

### Backend
- **Node.js** - Runtime del servidor
- **Express** - Framework web
- **Socket.IO** - WebSockets en tiempo real
- **Concurrently** - Ejecución simultánea de procesos

### Herramientas de Desarrollo
- **Angular CLI** - Scaffolding y build
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Git** - Control de versiones

## 📈 Análisis de Complejidad

### Operaciones Críticas del Bingo
- **Generación de cartón**: O(1) - 25 números fijos
- **Verificación de línea**: O(1) - 5 elementos máximo
- **Búsqueda de número**: O(1) - Uso de Set
- **Ordenamiento de rankings**: O(n log n) - Timsort
- **Filtrado de jugadores**: O(n) - Búsqueda lineal

### Optimizaciones Implementadas
- Cache de permisos con Map para acceso O(1)
- Normalización de texto para búsquedas eficientes
- Lazy Loading para reducir bundle inicial
- OnPush change detection en componentes críticos

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm test

# Ejecutar tests con coverage
npm run test:coverage

# Tests end-to-end
npm run e2e
```

## 📱 Responsive Design

La aplicación está optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🚀 Deployment

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

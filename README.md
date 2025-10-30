# FabGlass — Gestión de Ventanas y Presupuestos

Aplicación de escritorio para gestionar presupuestos, clientes y materiales en negocios de vidrio y ventanales. Construida con Electron y persistencia local en SQLite.

## Características
- Crear y listar presupuestos con cálculo de precios y estado de pago.
- Gestión de clientes (nombre, RUT, correo y teléfono).
- Definición de tipos de ventana y sus materiales asociados (cantidad y precio).
- Materiales por dimensión (por ancho y por alto) para parametrizar cálculos.
- Tipos de vidrio editables y cálculo rápido por medidas.
- Gastos mensuales e historial de liquidación.
- Tema claro/oscuro y navegación lateral simple.

## Tecnologías y arquitectura
- `Electron` (proceso `main` y `renderer` con `contextIsolation` y `preload`).
- `SQLite` (`sqlite3`) para almacenamiento local en `fabglass.db`.
- Comunicación segura mediante `IPC` expuesta desde `preload.js` a `window.api`.
- Empaquetado con `electron-builder` (objetivo Windows `nsis`).

## Requisitos
- Node.js 18+ recomendado.
- Windows (el instalador está configurado para `win/nsis`).

## Instalación y ejecución
1. Clonar el repositorio:
   - `git clone https://github.com/mnadones-png/Gestion-Ventanas.git`
   - `cd Gestion-Ventanas`
2. Instalar dependencias:
   - `npm install`
3. Ejecutar en desarrollo:
   - `npm start`
   - Opcional: habilitar DevTools en la ventana principal estableciendo la variable de entorno y luego arrancando:
     - PowerShell: ``$env:ELECTRON_DEVTOOLS = "1"; npm start``

## Construir instalador (Windows)
- `npm run build`
- Genera instalador `NSIS` usando la configuración de `electron-builder` en `package.json`.

## Base de datos y persistencia
- El archivo de base de datos SQLite se guarda en la carpeta de datos de usuario de la app: `app.getPath('userData')/fabglass.db`.
- Para reiniciar datos, puedes cerrar la app y eliminar ese archivo (se recreará al iniciar), ojo que perderás toda la información.

## Estructura del proyecto
- `src/main.js`: arranque del proceso principal de Electron, creación de ventana y registro de IPC.
- `src/main/database.js`: inicialización y esquemas de tablas SQLite.
- `src/main/ipc/*`: manejadores IPC para usuarios, presupuestos, abonos, gastos, liquidaciones y materiales por dimensión.
- `src/main/windows.js`: configuración de `BrowserWindow` y `preload`.
- `src/preload.js`: puente seguro (`contextBridge`) exponiendo funciones en `window.api`.
- `src/index.html` + `src/renderer.js`: UI y navegación (sidebar con vistas principales).
- `src/renderer/views/*`: vistas de negocio (presupuestos, clientes, tipos de ventana, etc.).
- `styles.css`: estilos de la interfaz.

## Licencia
Este proyecto está sujeto a los términos descritos en `license.md`. Uso interno para la empresa FabGlass; no se otorgan derechos de distribución ni modificación sin autorización.

## Autor
- Martin Adones

## Contribución
- Se agradecen issues y PRs que mejoren estabilidad o documentación. Antes de contribuir, revisa la sección de arquitectura y sigue el estilo existente.

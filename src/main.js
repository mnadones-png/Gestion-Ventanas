/**
 * Proceso principal de Electron (bootstrap)
 *
 * Responsabilidades:
 * - Inicializar la base de datos SQLite y exponer el handler `getDb`.
 * - Crear la ventana principal (`BrowserWindow`) con `preload.js`.
 * - Registrar todos los manejadores IPC para comunicación segura con el renderer.
 * - Gestionar ciclo de vida de la aplicación (ready, activate, window-all-closed).
 */
const { app, ipcMain, BrowserWindow } = require('electron');
const { initDatabase, getDb } = require('./main/database');
const { createMainWindow } = require('./main/windows');

// Registradores de IPC
const { registerUserIpc } = require('./main/ipc/users');
const { registerTiposVentanaIpc } = require('./main/ipc/tiposVentana');
const { registerPresupuestosIpc } = require('./main/ipc/presupuestos');
const { registerAbonosIpc } = require('./main/ipc/abonos');
const { registerGastosIpc } = require('./main/ipc/gastos');
const { registerLiquidacionesIpc } = require('./main/ipc/liquidaciones');
const { registerMaterialesDimensionIpc } = require('./main/ipc/materialesDimension');

/**
 * Registra manejadores IPC de los distintos módulos de dominio.
 * @param {import('sqlite3').Database} db - Conexión activa a la base de datos.
 */
function registerIpcHandlers(db) {
  registerUserIpc(ipcMain, db);
  registerTiposVentanaIpc(ipcMain, db);
  registerPresupuestosIpc(ipcMain, db);
  registerAbonosIpc(ipcMain, db);
  registerGastosIpc(ipcMain, db);
  registerLiquidacionesIpc(ipcMain, db);
  registerMaterialesDimensionIpc(ipcMain, db);
}

app.whenReady().then(() => {
  initDatabase();
  const db = getDb();

  createMainWindow();
  registerIpcHandlers(db);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

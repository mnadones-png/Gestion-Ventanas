/**
 * Configuración y creación de ventanas del proceso principal.
 * Crea la ventana principal con `contextIsolation` y `preload.js`.
 */
const { BrowserWindow } = require('electron');
const path = require('path');

/**
 * Crea la ventana principal de la aplicación.
 * @returns {BrowserWindow} instancia de la ventana principal
 */
function createMainWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadFile('src/index.html');
  win.removeMenu();

  // Habilitar DevTools en desarrollo si se define la variable de entorno
  if (process.env.ELECTRON_DEVTOOLS === '1') {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  return win;
}

module.exports = {
  createMainWindow
};



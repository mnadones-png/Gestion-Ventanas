/**
 * Registro de canales IPC relacionados con usuarios.
 * @param {import('electron').IpcMain} ipcMain
 * @param {import('sqlite3').Database} db
 */
function registerUserIpc(ipcMain, db) {
  ipcMain.handle('login', (event, { correo, contrasena }) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?', [correo, contrasena], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  });

  ipcMain.handle('registerUser', (event, { correo, contrasena }) => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO usuarios (correo, contrasena) VALUES (?, ?)', [correo, contrasena], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  });
}

module.exports = {
  registerUserIpc
};



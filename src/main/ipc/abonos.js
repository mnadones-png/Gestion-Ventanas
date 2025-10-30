/**
 * Canales IPC para abonos (pagos parciales de presupuestos).
 * Maneja inserción y consulta de abonos ordenados por fecha.
 */
const { formatLocalDateTime } = require('../utils/date');

/**
 * Registra canales relacionados con abonos.
 * @param {import('electron').IpcMain} ipcMain
 * @param {import('sqlite3').Database} db
 */
function registerAbonosIpc(ipcMain, db) {
  ipcMain.handle('agregarAbono', (event, abono) => {
    return new Promise((resolve, reject) => {
      const { presupuesto_id, monto, fecha, observacion } = abono;
      try {
        const fechaObj = fecha ? new Date(fecha) : new Date();
        const fechaLocal = formatLocalDateTime(fechaObj);
        db.run(
          'INSERT INTO abonos (presupuesto_id, monto, fecha, observacion) VALUES (?, ?, ?, ?)',
          [presupuesto_id, monto, fechaLocal, observacion],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, presupuesto_id, monto, fecha: fechaLocal, observacion });
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  });

  ipcMain.handle('getAbonosPresupuesto', (event, presupuestoId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM abonos WHERE presupuesto_id = ? ORDER BY fecha DESC',
        [presupuestoId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  });
}

module.exports = {
  registerAbonosIpc
};



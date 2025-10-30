const { formatLocalDate, formatLocalDateTime } = require('../utils/date');

function registerGastosIpc(ipcMain, db) {
  ipcMain.handle('agregarGasto', (event, gasto) => {
    return new Promise((resolve, reject) => {
      const { concepto, monto, fecha } = gasto;
      try {
        const fechaObj = fecha ? new Date(fecha) : new Date();
        const fechaLocal = formatLocalDateTime(fechaObj);
        db.run(
          'INSERT INTO gastos (concepto, monto, fecha) VALUES (?, ?, ?)',
          [concepto, monto, fechaLocal],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, concepto, monto, fecha: fechaLocal });
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  });

  ipcMain.handle('eliminarGasto', (event, id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM gastos WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  });

  ipcMain.handle('getGastosMensuales', (event, fecha) => {
    return new Promise((resolve, reject) => {
      try {
        const fechaObj = new Date(fecha);
        const inicio = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), 1);
        const fin = new Date(fechaObj.getFullYear(), fechaObj.getMonth() + 1, 0);
        const inicioMes = formatLocalDate(inicio);
        const finMes = formatLocalDate(fin);
        db.all(
          "SELECT * FROM gastos WHERE date(fecha, 'localtime') BETWEEN date(?) AND date(?) ORDER BY fecha DESC",
          [inicioMes, finMes],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  });

  ipcMain.handle('getIngresosMensuales', (event, fecha) => {
    return new Promise((resolve, reject) => {
      try {
        const fechaObj = new Date(fecha);
        const inicio = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), 1);
        const fin = new Date(fechaObj.getFullYear(), fechaObj.getMonth() + 1, 0);
        const inicioMes = formatLocalDate(inicio);
        const finMes = formatLocalDate(fin);
        db.all(
          `SELECT a.*, c.nombre as cliente, 'Abono presupuesto' as concepto 
           FROM abonos a
           JOIN presupuestos p ON a.presupuesto_id = p.id
           JOIN clientes c ON p.cliente_id = c.id
           WHERE date(a.fecha, 'localtime') BETWEEN date(?) AND date(?)
           ORDER BY a.fecha DESC`,
          [inicioMes, finMes],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  });
}

module.exports = {
  registerGastosIpc
};



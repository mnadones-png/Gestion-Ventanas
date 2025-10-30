function registerLiquidacionesIpc(ipcMain, db) {
  ipcMain.handle('generarLiquidacionMensual', (event, liquidacion) => {
    return new Promise((resolve, reject) => {
      const { fecha, ingresos, gastos, utilidad, detalleIngresos, detalleGastos } = liquidacion;
      db.run(
        `INSERT INTO liquidaciones 
         (fecha, ingresos, gastos, utilidad, detalle_ingresos, detalle_gastos) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          fecha,
          ingresos,
          gastos,
          utilidad,
          JSON.stringify(detalleIngresos),
          JSON.stringify(detalleGastos)
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...liquidacion });
        }
      );
    });
  });

  ipcMain.handle('getLiquidaciones', () => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM liquidaciones ORDER BY fecha DESC',
        [],
        (err, rows) => {
          if (err) reject(err);
          else {
            rows.forEach(row => {
              try {
                row.detalleIngresos = JSON.parse(row.detalle_ingresos);
                row.detalleGastos = JSON.parse(row.detalle_gastos);
                delete row.detalle_ingresos;
                delete row.detalle_gastos;
              } catch (e) {
                row.detalleIngresos = [];
                row.detalleGastos = [];
              }
            });
            resolve(rows);
          }
        }
      );
    });
  });
}

module.exports = {
  registerLiquidacionesIpc
};



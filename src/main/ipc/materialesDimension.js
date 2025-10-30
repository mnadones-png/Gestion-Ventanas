function registerMaterialesDimensionIpc(ipcMain, db) {
  ipcMain.handle('getMaterialesDimension', () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM materiales_dimension ORDER BY tipo, nombre', [], (err, rows) => {
        if (err) reject(err);
        else {
          const result = {
            porAncho: rows.filter(r => r.tipo === 'porAncho').map(r => r.nombre),
            porAlto: rows.filter(r => r.tipo === 'porAlto').map(r => r.nombre)
          };
          resolve(result);
        }
      });
    });
  });

  ipcMain.handle('agregarMaterialDimension', (event, { nombre, tipo }) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO materiales_dimension (nombre, tipo) VALUES (?, ?)',
        [nombre.toLowerCase(), tipo],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, nombre, tipo });
        }
      );
    });
  });

  ipcMain.handle('eliminarMaterialDimension', (event, id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM materiales_dimension WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  });
}

module.exports = {
  registerMaterialesDimensionIpc
};



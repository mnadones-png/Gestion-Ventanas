function registerTiposVentanaIpc(ipcMain, db) {
  ipcMain.handle('getTiposVentana', async () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tipos_ventana', [], (err, rows) => {
        if (err) reject(err);
        else {
          const tipos = rows;
          const promises = tipos.map(tipo => {
            return new Promise((res, rej) => {
              db.all('SELECT * FROM materiales_ventana WHERE tipo_ventana_id=?', [tipo.id], (err2, mats) => {
                if (err2) rej(err2);
                else {
                  tipo.materiales = mats;
                  res();
                }
              });
            });
          });
          Promise.all(promises).then(() => resolve(tipos)).catch(reject);
        }
      });
    });
  });

  ipcMain.handle('addTipoVentana', (event, { nombre, materiales }) => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO tipos_ventana (nombre) VALUES (?)', [nombre], function(err) {
        if (err) reject(err);
        else {
          const tipoId = this.lastID;
          const promises = materiales.map(mat => {
            return new Promise((res, rej) => {
              db.run('INSERT INTO materiales_ventana (tipo_ventana_id, nombre, tipo, cantidad, precio) VALUES (?, ?, ?, ?, ?)',
                [tipoId, mat.nombre, mat.tipo, mat.cantidad, mat.precio], function(err2) {
                  if (err2) rej(err2);
                  else res();
                });
            });
          });
          Promise.all(promises).then(() => resolve({ id: tipoId })).catch(reject);
        }
      });
    });
  });

  ipcMain.handle('editTipoVentana', (event, { id, nombre, materiales }) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE tipos_ventana SET nombre=? WHERE id=?', [nombre, id], function(err) {
        if (err) reject(err);
        else {
          db.run('DELETE FROM materiales_ventana WHERE tipo_ventana_id=?', [id], function(err2) {
            if (err2) reject(err2);
            else {
              const promises = materiales.map(mat => {
                return new Promise((res, rej) => {
                  db.run('INSERT INTO materiales_ventana (tipo_ventana_id, nombre, tipo, cantidad, precio) VALUES (?, ?, ?, ?, ?)',
                    [id, mat.nombre, mat.tipo, mat.cantidad, mat.precio], function(err3) {
                      if (err3) rej(err3);
                      else res();
                    });
                });
              });
              Promise.all(promises).then(() => resolve({ changes: materiales.length })).catch(reject);
            }
          });
        }
      });
    });
  });

  ipcMain.handle('deleteTipoVentana', (event, id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM tipos_ventana WHERE id=?', [id], function(err) {
        if (err) reject(err);
        else {
          db.run('DELETE FROM materiales_ventana WHERE tipo_ventana_id=?', [id], function(err2) {
            if (err2) reject(err2);
            else resolve({ changes: this.changes });
          });
        }
      });
    });
  });
}

module.exports = {
  registerTiposVentanaIpc
};



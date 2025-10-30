function registerPresupuestosIpc(ipcMain, db) {
  ipcMain.handle('addPresupuesto', async (event, presupuesto) => {
    const rut = presupuesto.cliente_rut ? presupuesto.cliente_rut.trim() : '';
    const nombre = presupuesto.cliente_nombre ? presupuesto.cliente_nombre.trim() : '';
    const correo = presupuesto.cliente_correo ? presupuesto.cliente_correo.trim() : null;
    const telefono = presupuesto.cliente_telefono ? presupuesto.cliente_telefono.trim() : null;
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM clientes WHERE LOWER(rut) = LOWER(?)', [rut], function(err, cliente) {
        if (err) return reject(err);
        function insertPresupuesto(clienteId) {
          const tipoVid = typeof presupuesto.tipo_vidrio_idx !== 'undefined' && presupuesto.tipo_vidrio_idx !== null ? Number(presupuesto.tipo_vidrio_idx) : null;
          const aplicaIva = presupuesto.aplica_iva ? 1 : 0;
          const precioFinal = typeof presupuesto.precio_final !== 'undefined' && presupuesto.precio_final !== null ? Number(presupuesto.precio_final) : null;
          const descripcion = typeof presupuesto.descripcion !== 'undefined' ? presupuesto.descripcion : null;
          db.run(`INSERT INTO presupuestos (cliente_id, tipo_ventana_id, tipo_vidrio_idx, ancho, alto, total, precio_final, aplica_iva, fecha, descripcion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [clienteId, presupuesto.tipo_ventana_id, tipoVid, presupuesto.ancho, presupuesto.alto, presupuesto.total, precioFinal, aplicaIva, presupuesto.fecha, descripcion],
            function(err2) {
              if (err2) reject(err2);
              else resolve({ id: this.lastID });
            });
        }
        if (cliente) {
          insertPresupuesto(cliente.id);
        } else {
          db.run('INSERT INTO clientes (nombre, rut, correo, telefono) VALUES (?, ?, ?, ?)',
            [nombre, rut, correo, telefono], function(err2) {
              if (err2) reject(err2);
              else insertPresupuesto(this.lastID);
            });
        }
      });
    });
  });

  ipcMain.handle('getPresupuestos', () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT p.*, c.nombre as cliente_nombre, c.rut as cliente_rut, c.correo as cliente_correo, c.telefono as cliente_telefono
              FROM presupuestos p
              LEFT JOIN clientes c ON p.cliente_id = c.id`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });

  ipcMain.handle('getClientes', () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM clientes ORDER BY nombre COLLATE NOCASE', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });

  ipcMain.handle('getPresupuestosPorCliente', (event, clienteId) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT p.*, t.nombre as tipo_ventana_nombre
              FROM presupuestos p
              LEFT JOIN tipos_ventana t ON p.tipo_ventana_id = t.id
              WHERE p.cliente_id = ?`, [clienteId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });

  ipcMain.handle('deletePresupuesto', (event, id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM presupuestos WHERE id=?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  });
}

module.exports = {
  registerPresupuestosIpc
};



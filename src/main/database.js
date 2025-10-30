const { app } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let db;

function initDatabase() {
  if (db) return db;
  const dbPath = path.join(app.getPath('userData'), 'fabglass.db');
  db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      correo TEXT UNIQUE,
      contrasena TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      rut TEXT UNIQUE,
      correo TEXT,
      telefono TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tipos_ventana (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS materiales_ventana (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_ventana_id INTEGER,
      nombre TEXT,
      tipo TEXT,
      cantidad REAL,
      precio REAL,
      FOREIGN KEY(tipo_ventana_id) REFERENCES tipos_ventana(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS presupuestos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      tipo_ventana_id INTEGER,
      tipo_vidrio_idx INTEGER,
      ancho REAL,
      alto REAL,
      total REAL,
      precio_final REAL,
      aplica_iva INTEGER,
      fecha TEXT,
      descripcion TEXT,
      FOREIGN KEY(cliente_id) REFERENCES clientes(id),
      FOREIGN KEY(tipo_ventana_id) REFERENCES tipos_ventana(id)
    )`);

    try { db.run("ALTER TABLE presupuestos ADD COLUMN descripcion TEXT", [], function(){}); } catch (e) {}
    try { db.run("ALTER TABLE presupuestos ADD COLUMN tipo_vidrio_idx INTEGER", [], function(){}); } catch (e) {}
    try { db.run("ALTER TABLE presupuestos ADD COLUMN aplica_iva INTEGER", [], function(){}); } catch (e) {}
    try { db.run("ALTER TABLE presupuestos ADD COLUMN precio_final REAL", [], function(){}); } catch (e) {}

    db.run(`CREATE TABLE IF NOT EXISTS abonos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      presupuesto_id INTEGER,
      monto REAL,
      fecha TEXT,
      observacion TEXT,
      FOREIGN KEY(presupuesto_id) REFERENCES presupuestos(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS gastos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concepto TEXT,
      monto REAL,
      fecha TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS liquidaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT,
      ingresos REAL,
      gastos REAL,
      utilidad REAL,
      detalle_ingresos TEXT,
      detalle_gastos TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS materiales_dimension (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      tipo TEXT
    )`);

    db.get('SELECT COUNT(*) as count FROM materiales_dimension', [], (err, row) => {
      if (err || row.count === 0) {
        const materialesIniciales = [
          ['riel superior', 'porAncho'],
          ['riel inferior', 'porAncho'],
          ['cabezal', 'porAncho'],
          ['zocalo', 'porAncho'],
          ['marco ancho', 'porAncho'],
          ['junquillo ancho', 'porAncho'],
          ['hoja ancho', 'porAncho'],
          ['pilar', 'porAncho'],
          ['jamba', 'porAlto'],
          ['pierna', 'porAlto'],
          ['traslapo', 'porAlto'],
          ['marco alto', 'porAlto'],
          ['junquillo alto', 'porAlto'],
          ['hoja alto', 'porAlto']
        ];
        const stmt = db.prepare('INSERT INTO materiales_dimension (nombre, tipo) VALUES (?, ?)');
        materialesIniciales.forEach(([nombre, tipo]) => { stmt.run(nombre, tipo); });
        stmt.finalize();
      }
    });
  });

  return db;
}

function getDb() {
  if (!db) throw new Error('La base de datos no está inicializada. Llama a initDatabase primero.');
  return db;
}

module.exports = {
  initDatabase,
  getDb
};



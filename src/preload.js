/**
 * preload.js - Puente seguro entre renderer y main
 *
 * Expone una API en `window.api` usando `contextBridge` para invocar canales IPC.
 * Todas las operaciones devuelven Promesas y están aisladas del contexto del renderer.
 */
const { contextBridge, ipcRenderer } = require('electron');

/**
 * API pública disponible en `window.api` dentro del renderer.
 * Cada método invoca un canal IPC correspondiente en el proceso principal.
 */
contextBridge.exposeInMainWorld('api', {
  /**
   * Autentica un usuario por correo y contraseña.
   * @param {string} correo
   * @param {string} contrasena
   * @returns {Promise<object|null>} Usuario encontrado o null
   */
  login: (correo, contrasena) => ipcRenderer.invoke('login', { correo, contrasena }),
  /**
   * Registra un usuario.
   * @param {string} correo
   * @param {string} contrasena
   * @returns {Promise<{id:number}>}
   */
  registerUser: (correo, contrasena) => ipcRenderer.invoke('registerUser', { correo, contrasena }),
  /**
   * Obtiene los tipos de ventana existentes.
   * @returns {Promise<Array>} Lista de tipos con materiales
   */
  getTiposVentana: () => ipcRenderer.invoke('getTiposVentana'),
  /**
   * Agrega un tipo de ventana.
   * @param {{nombre:string, materiales:Array}} tipo
   */
  addTipoVentana: (tipo) => ipcRenderer.invoke('addTipoVentana', tipo),
  /**
   * Edita un tipo de ventana existente.
   * @param {{id:number, nombre:string, materiales:Array}} tipo
   */
  editTipoVentana: (tipo) => ipcRenderer.invoke('editTipoVentana', tipo),
  /**
   * Elimina un tipo de ventana por id.
   * @param {number} id
   */
  deleteTipoVentana: (id) => ipcRenderer.invoke('deleteTipoVentana', id),
  /**
   * Agrega un presupuesto con datos del cliente y ventana.
   * @param {object} presupuesto
   */
  addPresupuesto: (presupuesto) => ipcRenderer.invoke('addPresupuesto', presupuesto),
  /**
   * Lista todos los presupuestos.
   * @returns {Promise<Array>}
   */
  getPresupuestos: () => ipcRenderer.invoke('getPresupuestos'),
  /**
   * Elimina un presupuesto por id.
   * @param {number} id
   */
  deletePresupuesto: (id) => ipcRenderer.invoke('deletePresupuesto', id),
  /**
   * Obtiene clientes registrados.
   * @returns {Promise<Array>}
   */
  getClientes: () => ipcRenderer.invoke('getClientes'),
  /**
   * Obtiene presupuestos por cliente.
   * @param {number} clienteId
   * @returns {Promise<Array>}
   */
  getPresupuestosPorCliente: (clienteId) => ipcRenderer.invoke('getPresupuestosPorCliente', clienteId),
  
  // Nuevas funciones para abonos
  /**
   * Agrega un abono a un presupuesto.
   * @param {{presupuesto_id:number, monto:number, fecha:string, observacion?:string}} abono
   */
  agregarAbono: (abono) => ipcRenderer.invoke('agregarAbono', abono),
  /**
   * Obtiene abonos de un presupuesto.
   * @param {number} presupuestoId
   * @returns {Promise<Array>}
   */
  getAbonosPresupuesto: (presupuestoId) => ipcRenderer.invoke('getAbonosPresupuesto', presupuestoId),
  
  // Funciones para gastos mensuales
  /**
   * Agrega un gasto mensual.
   * @param {{monto:number, fecha:string, descripcion?:string}} gasto
   */
  agregarGasto: (gasto) => ipcRenderer.invoke('agregarGasto', gasto),
  /**
   * Elimina un gasto mensual por id.
   * @param {number} id
   */
  eliminarGasto: (id) => ipcRenderer.invoke('eliminarGasto', id),
  getGastosMensuales: (fecha) => ipcRenderer.invoke('getGastosMensuales', fecha),
  getIngresosMensuales: (fecha) => ipcRenderer.invoke('getIngresosMensuales', fecha),
  
  // Funciones para liquidaciones mensuales
  generarLiquidacionMensual: (liquidacion) => ipcRenderer.invoke('generarLiquidacionMensual', liquidacion),
  getLiquidaciones: () => ipcRenderer.invoke('getLiquidaciones'),
  
  // Funciones para materiales por dimensión
  getMaterialesDimension: () => ipcRenderer.invoke('getMaterialesDimension'),
  agregarMaterialDimension: (material) => ipcRenderer.invoke('agregarMaterialDimension', material),
  eliminarMaterialDimension: (id) => ipcRenderer.invoke('eliminarMaterialDimension', id)
});

// preload.js - Comunicación segura entre renderer y main
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  login: (correo, contrasena) => ipcRenderer.invoke('login', { correo, contrasena }),
  registerUser: (correo, contrasena) => ipcRenderer.invoke('registerUser', { correo, contrasena }),
  getTiposVentana: () => ipcRenderer.invoke('getTiposVentana'),
  addTipoVentana: (tipo) => ipcRenderer.invoke('addTipoVentana', tipo),
  editTipoVentana: (tipo) => ipcRenderer.invoke('editTipoVentana', tipo),
  deleteTipoVentana: (id) => ipcRenderer.invoke('deleteTipoVentana', id),
  addPresupuesto: (presupuesto) => ipcRenderer.invoke('addPresupuesto', presupuesto),
  getPresupuestos: () => ipcRenderer.invoke('getPresupuestos'),
  deletePresupuesto: (id) => ipcRenderer.invoke('deletePresupuesto', id),
  getClientes: () => ipcRenderer.invoke('getClientes'),
  getPresupuestosPorCliente: (clienteId) => ipcRenderer.invoke('getPresupuestosPorCliente', clienteId),
  
  // Nuevas funciones para abonos
  agregarAbono: (abono) => ipcRenderer.invoke('agregarAbono', abono),
  getAbonosPresupuesto: (presupuestoId) => ipcRenderer.invoke('getAbonosPresupuesto', presupuestoId),
  
  // Funciones para gastos mensuales
  agregarGasto: (gasto) => ipcRenderer.invoke('agregarGasto', gasto),
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

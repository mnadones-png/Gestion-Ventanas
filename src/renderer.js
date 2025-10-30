/**
 * renderer.js - UI y navegación
 *
 * Renderiza el layout con sidebar/topbar, gestiona la navegación entre vistas,
 * alterna el tema claro/oscuro y delega a módulos de vistas y `window.api`.
 */
import { showInAppAlert, showInAppConfirm } from './renderer/modals.js';
import { materialesPorDimension, cargarMaterialesDimension } from './renderer/materiales.js';
import { imprimirPresupuestos as imprimirPresupuestosModule } from './renderer/printing.js';
import { showTiposVidrio as showTiposVidrioModule } from './renderer/views/vidrios.js';
import { showPresupuesto as showPresupuestoModule } from './renderer/views/presupuesto.js';
import { showTiposVentana as showTiposVentanaModule } from './renderer/views/tiposVentana.js';
import { showListaPresupuestos as showListaPresupuestosModule } from './renderer/views/listaPresupuestos.js';
import { showClientes as showClientesModule } from './renderer/views/clientes.js';
import { showMaterialesPorDimension as showMaterialesPorDimensionModule } from './renderer/views/materialesDimension.js';
import { showGastosMensuales as showGastosMensualesModule } from './renderer/views/gastosMensuales.js';
import { showHistorialLiquidacion as showHistorialLiquidacionModule } from './renderer/views/historialLiquidacion.js';
import { showCalculoRapido as showCalculoRapidoModule } from './renderer/views/calculoRapido.js';
import { state, setState } from './renderer/state.js';
const app = document.getElementById('app');

// Gestión de tema claro/oscuro
// Clave de persistencia para tema
const THEME_KEY = 'fabglass-theme';
function getTheme() { return localStorage.getItem(THEME_KEY) || 'light'; }
function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle('theme-dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}
/** Alterna entre tema claro/oscuro y actualiza el botón */
function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

function getViewTitle(view) {
  const titles = {
    welcome: 'Bienvenida',
    presupuesto: 'Nuevo presupuesto',
    listaPresupuestos: 'Lista de presupuestos',
    clientes: 'Clientes',
    tiposVentana: 'Tipos de ventana',
    materialesDimension: 'Materiales por dimensión',
    vidrios: 'Tipos de vidrio',
    gastosMensuales: 'Gastos mensuales',
    historialLiquidacion: 'Historial de liquidación',
    calculoRapido: 'Cálculo rápido'
  };
  return titles[view] || 'FabGlass';
}
function setTopbarTitle(view) {
  const el = document.getElementById('viewTitle');
  if (el) el.textContent = getViewTitle(view);
}

function render() {
  app.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="brand-logo">🪟</div>
          <div class="brand-title">FabGlass</div>
        </div>
        <nav class="nav">
          <button id="navPresupuesto" class="nav-item">🧾 Nuevo presupuesto</button>
          <button id="navLista" class="nav-item">📋 Lista de presupuestos</button>
          <button id="navClientes" class="nav-item">👥 Clientes</button>
          <button id="navTiposVentana" class="nav-item">🪟 Tipos de ventana</button>
          <button id="navMaterialesDimension" class="nav-item">📐 Materiales por dimensión</button>
          <button id="navVidrios" class="nav-item">🔍 Tipos de vidrio</button>
          <button id="navGastos" class="nav-item">💸 Gastos mensuales</button>
          <button id="navHistorial" class="nav-item">📈 Historial de liquidación</button>
          <button id="navCalculoRapido" class="nav-item">⚡ Cálculo rápido</button>
        </nav>
      </aside>
      <div class="main">
        <header class="topbar">
          <div id="viewTitle" class="topbar-title">${getViewTitle(currentView)}</div>
          <button id="theme-toggle" class="topbar-toggle" title="Cambiar tema">${getTheme() === 'dark' ? '☀️' : '🌙'}</button>
        </header>
        <section id="content" class="content"></section>
      </div>
    </div>
  `;

  // Navegación
  document.getElementById('navPresupuesto').onclick = () => { setView('presupuesto'); updateActiveNav('presupuesto'); setTopbarTitle('presupuesto'); showPresupuesto(); };
  document.getElementById('navLista').onclick = () => { setView('listaPresupuestos'); updateActiveNav('listaPresupuestos'); setTopbarTitle('listaPresupuestos'); showListaPresupuestosModule(); };
  document.getElementById('navClientes').onclick = () => { setView('clientes'); updateActiveNav('clientes'); setTopbarTitle('clientes'); showClientes(); };
  document.getElementById('navTiposVentana').onclick = () => { setView('tiposVentana'); updateActiveNav('tiposVentana'); setTopbarTitle('tiposVentana'); showTiposVentana(); };
  document.getElementById('navMaterialesDimension').onclick = () => { setView('materialesDimension'); updateActiveNav('materialesDimension'); setTopbarTitle('materialesDimension'); showMaterialesPorDimensionModule(); };
  document.getElementById('navVidrios').onclick = () => { setView('vidrios'); updateActiveNav('vidrios'); setTopbarTitle('vidrios'); showTiposVidrioModule(); };
  document.getElementById('navGastos').onclick = () => { setView('gastosMensuales'); updateActiveNav('gastosMensuales'); setTopbarTitle('gastosMensuales'); showGastosMensualesModule(); };
  document.getElementById('navHistorial').onclick = () => { setView('historialLiquidacion'); updateActiveNav('historialLiquidacion'); setTopbarTitle('historialLiquidacion'); showHistorialLiquidacionModule(); };
  document.getElementById('navCalculoRapido').onclick = () => { setView('calculoRapido'); updateActiveNav('calculoRapido'); setTopbarTitle('calculoRapido'); showCalculoRapido(); };

  // Toggle de tema
  document.getElementById('theme-toggle').onclick = () => toggleTheme();

  function updateActiveNav(view) {
    const map = {
      presupuesto: 'navPresupuesto',
      listaPresupuestos: 'navLista',
      clientes: 'navClientes',
      tiposVentana: 'navTiposVentana',
      materialesDimension: 'navMaterialesDimension',
      vidrios: 'navVidrios',
      gastosMensuales: 'navGastos',
      historialLiquidacion: 'navHistorial',
      calculoRapido: 'navCalculoRapido'
    };
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeId = map[view];
    if (activeId) {
      const activeEl = document.getElementById(activeId);
      if (activeEl) activeEl.classList.add('active');
    }
  }

  // Vista inicial
  updateActiveNav(currentView);
  setTopbarTitle(currentView);
  switch (currentView) {
    case 'welcome':
      showWelcome();
      break;
    case 'presupuesto':
      showPresupuesto();
      break;
    case 'listaPresupuestos':
      showListaPresupuestosModule();
      break;
    case 'clientes':
      showClientes();
      break;
    case 'tiposVentana':
      showTiposVentana();
      break;
    case 'materialesDimension':
      showMaterialesPorDimensionModule();
      break;
    case 'vidrios':
      showTiposVidrioModule();
      break;
    case 'gastosMensuales':
      showGastosMensualesModule();
      break;
    case 'historialLiquidacion':
      showHistorialLiquidacionModule();
      break;
    case 'calculoRapido':
      showCalculoRapido();
      break;
    default:
      showWelcome();
      break;
  }
}

// Inicio en la nueva vista de bienvenida en lugar del login
let { currentView, fechaActual, gastosMesActivo, mesCerrado, selectedMonth, selectedYear } = state;

/**
 * Cambia la vista actual de la aplicación y persiste en `state`.
 * @param {string} view - Identificador de vista (e.g. 'presupuesto').
 */
function setView(view) {
  currentView = view;
  setState({ currentView: view });
}

// Año mínimo y máximo visibles en selects
const YEAR_MIN = 2025;
const YEAR_MAX = 2040;

// Nueva vista de bienvenida que reemplaza al login/registro en la UI
/**
 * Vista de bienvenida (landing) con botón para iniciar en Presupuesto.
 */
function showWelcome() {
  const content = document.getElementById('content');
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:70vh;">
      <h1 style="font-size:2.2rem;margin-bottom:20px;">Bienvenido a FabGlass</h1>
      <p style="color:#666;margin-bottom:24px;">Gestiona presupuestos, clientes y materiales de forma sencilla.</p>
      <button id="btnEmpezar" class="button-primary" style="min-width:160px;padding:14px 20px;">Empezar</button>
    </div>
  `;
  while (tempDiv.firstChild) fragment.appendChild(tempDiv.firstChild);
  content.innerHTML = '';
  content.appendChild(fragment);
  document.getElementById('btnEmpezar').onclick = function() {
    currentView = 'presupuesto';
    render();
  };
}

async function showPresupuesto() { return showPresupuestoModule(); }

async function showCalculoRapido() { return showCalculoRapidoModule(); }

async function showTiposVentana() { return showTiposVentanaModule(); }

async function showHistorialLiquidacion() { return showHistorialLiquidacionModule(); }

// Vista de clientes y presupuestos asociados
async function showClientes() { return showClientesModule(); }

// Tipos de vidrio (editable)
let tiposVidrio = [
  { nombre: 'Incoloros de 4 mm 1,80 x 2,50', costo: 35790, mcosto: 7953, mventa: 15906 },
  { nombre: 'Incoloro de 5mm 1,80 x 2,50', costo: 62489, mcosto: 13886, mventa: 27772 },
  { nombre: 'incoloro de 6', costo: 96200, mcosto: 21377, mventa: 42754 },
  { nombre: 'bronce de 4 mm 1,80 x 2,50', costo: 96390, mcosto: 21420, mventa: 42840 },
  { nombre: 'bronce de 5 mm 1,80 x 2,50', costo: 107100, mcosto: 23800, mventa: 47600 },
  { nombre: 'Laminado de 6 mm 1,80 x 2,50', costo: 124000, mcosto: 27556, mventa: 55112 },
  { nombre: 'Laminado de 10 mm2,50 x 3,60', costo: 432900, mcosto: 48100, mventa: 96200 },
  { nombre: 'Reflecto float 4mm, 3,21 x 2,20', costo: 235566, mcosto: 26174, mventa: 52348 },
  { nombre: 'reflecto float 6mm. 3,21 x 2,20', costo: 311700, mcosto: 40480, mventa: 80960 },
  { nombre: 'Saten (empavonado) 3,66x2,44', costo: 374420, mcosto: 41928, mventa: 83856 },
  { nombre: 'alabron3 mm 2,44x1,22', costo: 43745, mcosto: 14930, mventa: 29860 },
  { nombre: 'alabron4 mm 2,50 x 1,575', costo: 88214, mcosto: 22335, mventa: 44670 },
  { nombre: 'Laminado de 6 mm2,00x2,44', costo: 200000, mcosto: 40983, mventa: 81966 },
  { nombre: 'vidrio templ 10 mm x 1', costo: 58900, mcosto: 58900, mventa: 117800 },
  { nombre: 'vidrio templado 12 mm x 1', costo: 84850, mcosto: 84850, mventa: 169700 }
];

function showTiposVidrio() { return showTiposVidrioModule(); }

// Función para renderizar la tabla de presupuestos
async function renderTablaPresupuestos(filtrados, tipos) {
  const tbody = document.querySelector('#tablaListaPresupuestos tbody');
  const fragment = document.createDocumentFragment();
  for (const p of filtrados) {
    const tipo = tipos.find(t => t.id === p.tipo_ventana_id);
  const precioVenta = Math.round(p.total * 2);
  const abonos = await window.api.getAbonosPresupuesto(p.id);
  const totalAbonado = abonos.reduce((sum, a) => sum + a.monto, 0);
  const persistedPrecioFinal = typeof p.precio_final !== 'undefined' && p.precio_final !== null ? Number(p.precio_final) : null;
  const persistedAplicaIva = typeof p.aplica_iva !== 'undefined' && p.aplica_iva !== null ? Boolean(p.aplica_iva) : null;
  const iva = persistedAplicaIva === null ? (precioVenta * 0.19) : (persistedAplicaIva ? (precioVenta * 0.19) : 0);
  const precioFinal = persistedPrecioFinal !== null ? persistedPrecioFinal : (precioVenta + iva);
  const saldoPendiente = Math.round(precioFinal - totalAbonado);
    const estado = saldoPendiente <= 0 ? 'Pagado' : 'Pendiente';
    const estadoClass = saldoPendiente <= 0 ? 'estado-pagado' : 'estado-pendiente';

    const tr = document.createElement('tr');
    tr.innerHTML = `<td style="text-align:center;"><input type="checkbox" class="presupuesto-checkbox" data-id="${p.id}"></td>
      <td>${p.cliente_nombre}</td>
      <td>${tipo ? tipo.nombre : ''}</td>
      <td>${p.ancho} x ${p.alto}</td>
      <td>$${Math.round(p.total).toLocaleString()}</td>
      <td>$${precioVenta.toLocaleString()}</td>
      <td>$${totalAbonado.toLocaleString()}</td>
      <td><span class="${estadoClass}">${estado}</span></td>
      <td>${p.fecha}</td>
      <td>${p.descripcion ? p.descripcion : ''}</td>
      <td>
        <button type="button" class="button-primary" onclick="verDetallePresupuesto(${p.id})">Ver</button>
        <button type="button" class="button-primary" onclick="eliminarPresupuesto(${p.id})">Eliminar</button>
      </td>`;
    fragment.appendChild(tr);
  }
  tbody.innerHTML = '';
  tbody.appendChild(fragment);
}

window.verDetallePresupuesto = async function(id) {
  const presupuestos = await window.api.getPresupuestos();
  const tipos = await window.api.getTiposVentana();
  const p = presupuestos.find(x => x.id === id);
  if (!p) return;
  
  const tipo = tipos.find(t => t.id === p.tipo_ventana_id);
  const abonos = await window.api.getAbonosPresupuesto(id);
  const totalAbonado = abonos.reduce((sum, a) => sum + a.monto, 0);
  const precioVenta = Math.round(p.total * 2);
  const persistedPrecioFinalD = typeof p.precio_final !== 'undefined' && p.precio_final !== null ? Number(p.precio_final) : null;
  const persistedAplicaIvaD = typeof p.aplica_iva !== 'undefined' && p.aplica_iva !== null ? Boolean(p.aplica_iva) : null;
  const iva = persistedAplicaIvaD === null ? (precioVenta * 0.19) : (persistedAplicaIvaD ? (precioVenta * 0.19) : 0);
  const precioFinal = persistedPrecioFinalD !== null ? persistedPrecioFinalD : (precioVenta + iva);
  const saldoPendiente = Math.round(precioFinal - totalAbonado);

  let html = `<h3>Detalle del presupuesto</h3>`;
  html += `<b>Cliente:</b> ${p.cliente_nombre}<br>`;
  html += `<b>RUT:</b> ${p.cliente_rut}<br>`;
  html += `<b>Teléfono:</b> ${p.cliente_telefono}<br>`;
  html += `<b>Correo:</b> ${p.cliente_correo}<br>`;
  html += `<b>Tipo de ventana:</b> ${tipo ? tipo.nombre : ''}<br>`;
  html += `<b>Medidas:</b> ${p.ancho} x ${p.alto}<br>`;
  html += `<b>Fecha:</b> ${p.fecha}<br>`;
  html += `<b>Descripción:</b> ${p.descripcion ? p.descripcion : '(Sin descripción)'}<br>`;
  
  // Sección de pagos
  html += `
    <div class="seccion-pagos">
      <h4>Estado de Pago</h4>
      <div class="resumen-pago">
        <div class="pago-item">
          <span>Precio Final:</span>
          <span>$${precioFinal.toLocaleString()}</span>
        </div>
        <div class="pago-item">
          <span>Total Abonado:</span>
          <span>$${totalAbonado.toLocaleString()}</span>
        </div>
        <div class="pago-item ${saldoPendiente > 0 ? 'pendiente' : 'pagado'}">
          <span>Saldo Pendiente:</span>
          <span>$${saldoPendiente.toLocaleString()}</span>
        </div>
      </div>

      <div class="historial-abonos">
        <h5>Historial de Abonos</h5>
        ${abonos.length > 0 ? `
          <table class="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              ${abonos.map(a => `
                <tr>
                  <td>${new Date(a.fecha).toLocaleDateString()}</td>
                  <td>$${a.monto.toLocaleString()}</td>
                  <td>${a.observacion || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No hay abonos registrados</p>'}
      </div>

      <form id="formNuevoAbono" class="form-nuevo-abono">
        <h5>Registrar Nuevo Abono</h5>
        <div class="form-group">
          <input type="number" id="montoAbono" placeholder="Monto del abono" required min="1">
          <input type="text" id="observacionAbono" placeholder="Observación (opcional)">
        </div>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <label style="margin:0 6px 0 0;">Asignar abono a mes/año</label>
          <select id="selectAbonoMes"></select>
          <select id="selectAbonoYear"></select>
          <button type="submit" class="button-primary">Registrar Abono</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('detallePresupuesto').innerHTML = html;

  // Poblar selects de mes/año para asignación explícita del abono
  (function poblarSelectsAbono() {
    const mesesArr = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const selectMes = document.getElementById('selectAbonoMes');
    const selectYear = document.getElementById('selectAbonoYear');
    const now = new Date();
    const currentYear = now.getFullYear();
    // Rellenar meses
    selectMes.innerHTML = mesesArr.map((m, idx) => `<option value="${idx}">${m}</option>`).join('');
  // Rellenar años (desde YEAR_MIN hasta YEAR_MAX)
  let yearsHtml = '';
  for (let y = YEAR_MIN; y <= YEAR_MAX; y++) yearsHtml += `<option value="${y}">${y}</option>`;
  selectYear.innerHTML = yearsHtml;

    // Valor por defecto: si hay mes seleccionado en la UI de Gastos Mensuales, usarlo;
    // si ese mes está cerrado, por comodidad preseleccionar el mes siguiente.
    let defMonth = now.getMonth();
    let defYear = now.getFullYear();
    if (typeof selectedMonth === 'number' && typeof selectedYear === 'number') {
      if (mesCerrado) {
        defMonth = selectedMonth + 1;
        defYear = selectedYear;
        if (defMonth > 11) { defMonth = 0; defYear += 1; }
      } else {
        defMonth = selectedMonth;
        defYear = selectedYear;
      }
    }
    // Ajustar si el año por defecto queda fuera del rango del select
    if (!Array.from(selectYear.options).some(o => Number(o.value) === defYear)) {
      defYear = Math.min(YEAR_MAX, currentYear);
    }
    selectMes.value = defMonth;
    selectYear.value = defYear;
  })();

  // Manejar el registro de nuevos abonos
  document.getElementById('formNuevoAbono').onsubmit = async function(e) {
    e.preventDefault();
    const monto = Number(document.getElementById('montoAbono').value);
    const observacion = document.getElementById('observacionAbono').value;

    if (monto <= 0) {
      await showInAppAlert('Aviso', 'El monto del abono debe ser mayor a 0.');
      return;
    }

    try {
      // Determinar la fecha a guardar según la selección del usuario
      const selMes = Number(document.getElementById('selectAbonoMes').value);
      const selYear = Number(document.getElementById('selectAbonoYear').value);

      // Verificar si existe una liquidación para el mes/año seleccionado (mes cerrado)
      const todasLiquidaciones = await window.api.getLiquidaciones();
      const mesCerradoSeleccionado = todasLiquidaciones.some(l => {
        const d = new Date(l.fecha);
        return d.getFullYear() === selYear && d.getMonth() === selMes;
      });
      if (mesCerradoSeleccionado) {
        await showInAppAlert('Error', 'Error mes cerrado');
        return;
      }

      let fechaGuardar;
      try {
        const hoy = new Date();
        const lastDay = new Date(selYear, selMes + 1, 0).getDate();
        const dia = Math.min(hoy.getDate(), lastDay);
        fechaGuardar = new Date(selYear, selMes, dia).toISOString();
      } catch (e) {
        fechaGuardar = new Date().toISOString();
      }

      await window.api.agregarAbono({
        presupuesto_id: id,
        monto,
        fecha: fechaGuardar,
        observacion
      });

      // Actualizar la vista
      verDetallePresupuesto(id);
      
      // Actualizar la tabla principal
      const presupuestosActualizados = await window.api.getPresupuestos();
      await renderTablaPresupuestos(presupuestosActualizados, tipos);
      
      // Limpiar el formulario
      document.getElementById('formNuevoAbono').reset();
      
      // Mostrar modal de éxito
      const modalHTML = `
        <div id="modalExito" style="display:flex;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;">
          <div style="background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);text-align:center;max-width:400px;">
            <div style="color:#28a745;font-size:48px;margin-bottom:20px;">✓</div>
            <h3 style="margin:0 0 20px 0;color:#333;">¡Éxito!</h3>
            <p style="margin:0 0 20px 0;color:#666;">Abono registrado correctamente</p>
            <button id="btnCerrarModalExito" class="button-primary" style="min-width:120px;">Aceptar</button>
          </div>
        </div>
      `;
      
      // Agregar el modal al DOM
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHTML;
      document.body.appendChild(modalContainer.firstElementChild);
      
      // Enfocar el botón de cerrar
      setTimeout(() => {
        const btnCerrar = document.getElementById('btnCerrarModalExito');
        btnCerrar.focus();
        btnCerrar.onclick = () => {
          document.getElementById('modalExito').remove();
        };
      }, 100);
    } catch (error) {
      await showInAppAlert('Error', 'Error al registrar el abono: ' + error.message);
    }
  };
}

async function showListaPresupuestos() { return showListaPresupuestosModule(); }

// Función para imprimir presupuestos seleccionados (delegada al módulo)
async function imprimirPresupuestos(presupuestos, tipos) {
  return imprimirPresupuestosModule(presupuestos, tipos, tiposVidrio);
}

// Aplicar tema guardado y renderizar
applyTheme(getTheme());
render();

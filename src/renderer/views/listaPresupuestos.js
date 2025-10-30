import { showInAppAlert, showInAppConfirm } from '../modals.js';
import { imprimirPresupuestos } from '../printing.js';

export async function showListaPresupuestos() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h2>Presupuestos creados</h2>
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:15px;flex-wrap:wrap;">
      <input type="text" id="buscarPresupuesto" placeholder="Buscar por cliente, tipo o fecha" style="width:300px;margin:0;">
      <button id="btnImprimirSeleccionados" class="button-print" disabled>Imprimir Seleccionados</button>
      <button id="btnSeleccionarTodos" class="button-selection">Seleccionar Todos</button>
      <button id="btnDeseleccionarTodos" class="button-selection">Deseleccionar Todos</button>
    </div>
    <div id="detallePresupuesto"></div>
    <table class="table" id="tablaListaPresupuestos">
      <thead>
        <tr>
          <th style="width:40px;"><input type="checkbox" id="selectAllCheckbox"></th>
          <th>Cliente</th>
          <th>Tipo Ventana</th>
          <th>Medidas</th>
          <th>Precio costo</th>
          <th>Precio venta</th>
          <th>Total abonado</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    <div id="modalConfirm" style="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:9999;align-items:center;justify-content:center;">
      <div style="background:#fff;padding:30px 20px;border-radius:8px;box-shadow:0 2px 10px #222;max-width:350px;margin:auto;text-align:center;">
        <h3>¿Seguro que quieres eliminar este presupuesto?</h3>
        <button id="btnConfirmSi" class="button-primary" style="margin-right:10px;">Sí</button>
        <button id="btnConfirmNo" class="button-primary">No</button>
      </div>
    </div>
  `;

  let [presupuestos, tipos] = await Promise.all([
    window.api.getPresupuestos(),
    window.api.getTiposVentana()
  ]);

  await renderTablaPresupuestos(presupuestos, tipos);

  document.getElementById('buscarPresupuesto').addEventListener('input', async function() {
    const q = this.value.toLowerCase();
    presupuestos = await window.api.getPresupuestos();
    tipos = await window.api.getTiposVentana();
    const filtrados = presupuestos.filter(p => {
      const tipo = tipos.find(t => t.id === p.tipo_ventana_id);
      return (
        p.cliente_nombre.toLowerCase().includes(q) ||
        (tipo && tipo.nombre.toLowerCase().includes(q)) ||
        p.fecha.toLowerCase().includes(q) ||
        (p.cliente_rut && p.cliente_rut.toLowerCase().includes(q)) ||
        (p.cliente_correo && p.cliente_correo.toLowerCase().includes(q)) ||
        (p.cliente_telefono && p.cliente_telefono.toLowerCase().includes(q)) ||
        (`${p.ancho} x ${p.alto}`.toLowerCase().includes(q))
      );
    });
    await renderTablaPresupuestos(filtrados, tipos);
  });

  window.eliminarPresupuesto = async function(id) {
    const modal = document.getElementById('modalConfirm');
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('btnConfirmSi').focus(), 100);
    document.getElementById('btnConfirmSi').onclick = async function() {
      modal.style.display = 'none';
      await window.api.deletePresupuesto(id);
      [presupuestos, tipos] = await Promise.all([
        window.api.getPresupuestos(),
        window.api.getTiposVentana()
      ]);
      await renderTablaPresupuestos(presupuestos, tipos);
      document.getElementById('detallePresupuesto').innerHTML = '';
      const buscarInput = document.getElementById('buscarPresupuesto');
      if (buscarInput) buscarInput.focus();
    };
    document.getElementById('btnConfirmNo').onclick = function() {
      modal.style.display = 'none';
      const buscarInput = document.getElementById('buscarPresupuesto');
      if (buscarInput) buscarInput.focus();
    };
  };

  function actualizarBotonImprimir() {
    const checkboxes = document.querySelectorAll('.presupuesto-checkbox:checked');
    const btnImprimir = document.getElementById('btnImprimirSeleccionados');
    btnImprimir.disabled = checkboxes.length === 0;
  }

  document.getElementById('selectAllCheckbox').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('.presupuesto-checkbox');
    checkboxes.forEach(cb => cb.checked = this.checked);
    actualizarBotonImprimir();
  });

  document.addEventListener('change', function(e) {
    if (e.target.classList.contains('presupuesto-checkbox')) {
      const selectAllCheckbox = document.getElementById('selectAllCheckbox');
      const checkboxes = document.querySelectorAll('.presupuesto-checkbox');
      const checkedCheckboxes = document.querySelectorAll('.presupuesto-checkbox:checked');
      selectAllCheckbox.checked = checkboxes.length === checkedCheckboxes.length;
      selectAllCheckbox.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < checkboxes.length;
      actualizarBotonImprimir();
    }
  });

  document.getElementById('btnSeleccionarTodos').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('.presupuesto-checkbox');
    checkboxes.forEach(cb => cb.checked = true);
    document.getElementById('selectAllCheckbox').checked = true;
    actualizarBotonImprimir();
  });

  document.getElementById('btnDeseleccionarTodos').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('.presupuesto-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    document.getElementById('selectAllCheckbox').checked = false;
    actualizarBotonImprimir();
  });

  document.getElementById('btnImprimirSeleccionados').addEventListener('click', async function() {
    const checkboxes = document.querySelectorAll('.presupuesto-checkbox:checked');
    if (checkboxes.length === 0) {
      await showInAppAlert('Aviso', 'Selecciona al menos un presupuesto para imprimir.');
      return;
    }
    const seleccionados = [];
    for (const checkbox of checkboxes) {
      const presupuestoId = parseInt(checkbox.dataset.id);
      const presupuesto = presupuestos.find(p => p.id === presupuestoId);
      if (presupuesto) seleccionados.push(presupuesto);
    }
    await imprimirPresupuestos(seleccionados, tipos, window.tiposVidrio || []);
  });
}

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
  html += `
    <div class="seccion-pagos">
      <h4>Estado de Pago</h4>
      <div class="resumen-pago">
        <div class="pago-item"><span>Precio Final:</span><span>$${precioFinal.toLocaleString()}</span></div>
        <div class="pago-item"><span>Total Abonado:</span><span>$${totalAbonado.toLocaleString()}</span></div>
        <div class="pago-item ${saldoPendiente > 0 ? 'pendiente' : 'pagado'}"><span>Saldo Pendiente:</span><span>$${saldoPendiente.toLocaleString()}</span></div>
      </div>
      <div class="historial-abonos">
        <h5>Historial de Abonos</h5>
        ${abonos.length > 0 ? `
          <table class="table">
            <thead><tr><th>Fecha</th><th>Monto</th><th>Observación</th></tr></thead>
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
    </div>`;
  document.getElementById('detallePresupuesto').innerHTML = html;
  poblarSelectsAbono();
  document.getElementById('formNuevoAbono').onsubmit = async function(e) {
    e.preventDefault();
    const monto = Number(document.getElementById('montoAbono').value);
    const observacion = document.getElementById('observacionAbono').value;
    if (monto <= 0) { await showInAppAlert('Aviso', 'El monto del abono debe ser mayor a 0.'); return; }
    try {
      const selMes = Number(document.getElementById('selectAbonoMes').value);
      const selYear = Number(document.getElementById('selectAbonoYear').value);
      const todasLiquidaciones = await window.api.getLiquidaciones();
      const mesCerradoSeleccionado = todasLiquidaciones.some(l => {
        const d = new Date(l.fecha);
        return d.getFullYear() === selYear && d.getMonth() === selMes;
      });
      if (mesCerradoSeleccionado) { await showInAppAlert('Error', 'Error mes cerrado'); return; }
      let fechaGuardar;
      try {
        const hoy = new Date();
        const lastDay = new Date(selYear, selMes + 1, 0).getDate();
        const dia = Math.min(hoy.getDate(), lastDay);
        fechaGuardar = new Date(selYear, selMes, dia).toISOString();
      } catch (e) { fechaGuardar = new Date().toISOString(); }
      await window.api.agregarAbono({ presupuesto_id: id, monto, fecha: fechaGuardar, observacion });
      verDetallePresupuesto(id);
      const presupuestosActualizados = await window.api.getPresupuestos();
      await renderTablaPresupuestos(presupuestosActualizados, tipos);
      document.getElementById('formNuevoAbono').reset();
      const modalHTML = `
        <div id="modalExito" style="display:flex;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;">
          <div style="background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);text-align:center;max-width:400px;">
            <div style="color:#28a745;font-size:48px;margin-bottom:20px;">✓</div>
            <h3 style="margin:0 0 20px 0;color:#333;">¡Éxito!</h3>
            <p style="margin:0 0 20px 0;color:#666;">Abono registrado correctamente</p>
            <button id="btnCerrarModalExito" class="button-primary" style="min-width:120px;">Aceptar</button>
          </div>
        </div>`;
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHTML;
      document.body.appendChild(modalContainer.firstElementChild);
      setTimeout(() => {
        const btnCerrar = document.getElementById('btnCerrarModalExito');
        btnCerrar.focus();
        btnCerrar.onclick = () => { document.getElementById('modalExito').remove(); };
      }, 100);
    } catch (error) { await showInAppAlert('Error', 'Error al registrar el abono: ' + error.message); }
  };
}

function poblarSelectsAbono() {
  const mesesArr = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const selectMes = document.getElementById('selectAbonoMes');
  const selectYear = document.getElementById('selectAbonoYear');
  const YEAR_MIN = 2025; const YEAR_MAX = 2040;
  const now = new Date();
  const currentYear = now.getFullYear();
  selectMes.innerHTML = mesesArr.map((m, idx) => `<option value="${idx}">${m}</option>`).join('');
  let yearsHtml = '';
  for (let y = YEAR_MIN; y <= YEAR_MAX; y++) yearsHtml += `<option value="${y}">${y}</option>`;
  selectYear.innerHTML = yearsHtml;
  let defMonth = now.getMonth(); let defYear = now.getFullYear();
  selectMes.value = defMonth; selectYear.value = defYear;
}



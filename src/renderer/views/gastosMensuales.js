import { showInAppAlert, showInAppConfirm } from '../modals.js';

export async function showGastosMensuales() {
  const content = document.getElementById('content');
  const YEAR_MIN = 2025, YEAR_MAX = 2040;
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  content.innerHTML = `
    <h2>Gastos Mensuales</h2>
    <div style="display:flex;gap:12px;align-items:end;margin-bottom:16px;flex-wrap:wrap;">
      <div>
        <label for="selectGastoMes">Mes</label>
        <select id="selectGastoMes">${meses.map((m, idx) => `<option value="${idx}" ${idx === currentMonth ? 'selected' : ''}>${m}</option>`).join('')}</select>
      </div>
      <div>
        <label for="selectGastoYear">Año</label>
        <select id="selectGastoYear">${(() => { let h=''; for(let y=YEAR_MIN;y<=YEAR_MAX;y++) h+=`<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`; return h; })()}</select>
      </div>
      <div>
        <button id="btnAbrirMes" class="button-primary">Abrir mes</button>
      </div>
      <div id="estadoMes" style="margin-left:12px;color:#e17055;font-weight:600;"></div>
    </div>

    <div id="gastosSection" style="display:none;">
      <div class="gastos-grid">
        <div class="seccion-ingresos">
          <h3>Ingresos</h3>
          <div id="listaIngresos">
            <table class="table">
              <thead>
                <tr><th>Fecha</th><th>Cliente</th><th>Concepto</th><th>Monto</th></tr>
              </thead>
              <tbody id="tbodyIngresos"></tbody>
            </table>
          </div>
          <div class="total-ingresos">
            <strong>Total Ingresos: $<span id="totalIngresos">0</span></strong>
          </div>
        </div>
        <div class="seccion-gastos">
          <h3>Gastos</h3>
          <form id="formNuevoGasto" class="form-nuevo-gasto">
            <input type="text" id="conceptoGasto" placeholder="Concepto del gasto" required>
            <input type="number" id="montoGasto" placeholder="Monto" required>
            <button type="submit" class="button-primary">Agregar Gasto</button>
          </form>
          <div id="listaGastos">
            <table class="table">
              <thead>
                <tr><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Acciones</th></tr>
              </thead>
              <tbody id="tbodyGastos"></tbody>
            </table>
          </div>
          <div class="total-gastos">
            <strong>Total Gastos: $<span id="totalGastos">0</span></strong>
          </div>
        </div>
      </div>
      <div class="resumen-mensual">
        <h3>Resumen del Mes</h3>
        <div class="resumen-grid">
          <div class="resumen-item"><span>Total Ingresos:</span><span class="monto" id="resumenIngresos">$0</span></div>
          <div class="resumen-item"><span>Total Gastos:</span><span class="monto" id="resumenGastos">$0</span></div>
          <div class="resumen-item utilidad"><span>Utilidad del Mes:</span><span class="monto" id="resumenUtilidad">$0</span></div>
        </div>
        <button id="btnCerrarMes" class="button-primary">Cerrar Mes y Generar Liquidación</button>
      </div>
    </div>
  `;

  const estadoMesEl = document.getElementById('estadoMes');
  const gastosSection = document.getElementById('gastosSection');
  let gastosMes = [], ingresosMes = [];
  let selectedMonth = null, selectedYear = null;
  let mesCerrado = false;
  let fechaActual = new Date();

  function actualizarTotales() {
    const totalIngresos = ingresosMes.reduce((sum, i) => sum + i.monto, 0);
    const totalGastos = gastosMes.reduce((sum, g) => sum + g.monto, 0);
    const utilidad = totalIngresos - totalGastos;
    document.getElementById('totalIngresos').textContent = totalIngresos.toLocaleString();
    document.getElementById('totalGastos').textContent = totalGastos.toLocaleString();
    document.getElementById('resumenIngresos').textContent = `$${totalIngresos.toLocaleString()}`;
    document.getElementById('resumenGastos').textContent = `$${totalGastos.toLocaleString()}`;
    const u = document.getElementById('resumenUtilidad');
    u.textContent = `$${utilidad.toLocaleString()}`;
    u.className = `monto ${utilidad >= 0 ? 'ganancia' : 'perdida'}`;
  }

  function renderizarGastos() {
    const tbody = document.getElementById('tbodyGastos');
    tbody.innerHTML = gastosMes.map(g => `
      <tr>
        <td>${new Date(g.fecha).toLocaleDateString()}</td>
        <td>${g.concepto}</td>
        <td>$${g.monto.toLocaleString()}</td>
        <td><button data-del="${g.id}" class="button-delete">Eliminar</button></td>
      </tr>
    `).join('');
    tbody.querySelectorAll('button[data-del]').forEach(btn => {
      btn.onclick = async function() {
        const id = Number(this.getAttribute('data-del'));
        const ok = await showInAppConfirm('Eliminar gasto', '¿Estás seguro de eliminar este gasto?');
        if (!ok) return;
        await window.api.eliminarGasto(id);
        gastosMes = gastosMes.filter(g => g.id !== id);
        renderizarGastos(); actualizarTotales();
      };
    });
  }

  function renderizarIngresos() {
    const tbody = document.getElementById('tbodyIngresos');
    tbody.innerHTML = ingresosMes.map(i => `
      <tr>
        <td>${new Date(i.fecha).toLocaleDateString()}</td>
        <td>${i.cliente}</td>
        <td>${i.concepto}</td>
        <td>$${i.monto.toLocaleString()}</td>
      </tr>
    `).join('');
  }

  document.getElementById('btnAbrirMes').onclick = async function() {
    selectedMonth = Number(document.getElementById('selectGastoMes').value);
    selectedYear = Number(document.getElementById('selectGastoYear').value);
    fechaActual = new Date(selectedYear, selectedMonth, 1);
    const todasLiquidaciones = await window.api.getLiquidaciones();
    mesCerrado = !!todasLiquidaciones.some(l => { const d = new Date(l.fecha); return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth; });
    estadoMesEl.textContent = mesCerrado ? 'Mes cerrado: no se permiten más registros' : `Mes abierto: ${meses[selectedMonth]} ${selectedYear}`;
    gastosSection.style.display = 'block';
    gastosMes = await window.api.getGastosMensuales(fechaActual);
    ingresosMes = await window.api.getIngresosMensuales(fechaActual);
    renderizarGastos(); renderizarIngresos(); actualizarTotales();
    const form = document.getElementById('formNuevoGasto');
    form.style.display = mesCerrado ? 'none' : 'block';
  };

  document.getElementById('formNuevoGasto').onsubmit = async function(e) {
    e.preventDefault();
    const concepto = document.getElementById('conceptoGasto').value;
    const monto = Number(document.getElementById('montoGasto').value);
    if (!(selectedMonth || selectedMonth === 0) || !selectedYear || mesCerrado) { await showInAppAlert('Aviso', 'No hay mes abierto o el mes está cerrado.'); return; }
    if (monto <= 0) { await showInAppAlert('Aviso', 'El monto debe ser mayor a 0'); return; }
    try {
      const hoy = new Date();
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const dia = Math.min(hoy.getDate(), lastDay);
      const fechaParaGuardar = new Date(selectedYear, selectedMonth, dia).toISOString();
      const nuevoGasto = await window.api.agregarGasto({ concepto, monto, fecha: fechaParaGuardar });
      gastosMes.unshift(nuevoGasto); renderizarGastos(); actualizarTotales(); this.reset();
    } catch (error) { await showInAppAlert('Error', 'Error al registrar el gasto: ' + error.message); }
  };

  document.getElementById('btnCerrarMes').onclick = async function() {
    if (!(selectedMonth || selectedMonth === 0)) { await showInAppAlert('Aviso', 'Abre primero el mes que deseas cerrar.'); return; }
    if (mesCerrado) { await showInAppAlert('Aviso', 'El mes ya está cerrado.'); return; }
    const confirmClose = await showInAppConfirm('¿Cerrar mes?', '¿Estás seguro de cerrar el mes seleccionado? No se podrán agregar más gastos ni ingresos para ese mes.');
    if (!confirmClose) return;
    const totalIngresos = ingresosMes.reduce((sum, i) => sum + i.monto, 0);
    const totalGastos = gastosMes.reduce((sum, g) => sum + g.monto, 0);
    const utilidad = totalIngresos - totalGastos;
    const fechaLiquidacion = new Date(selectedYear, selectedMonth, 1).toISOString();
    await window.api.generarLiquidacionMensual({ fecha: fechaLiquidacion, ingresos: totalIngresos, gastos: totalGastos, utilidad, detalleIngresos: ingresosMes, detalleGastos: gastosMes });
    mesCerrado = true; document.getElementById('formNuevoGasto').style.display = 'none'; estadoMesEl.textContent = 'Mes cerrado: liquidación generada';
    ingresosMes = await window.api.getIngresosMensuales(fechaActual);
    gastosMes = await window.api.getGastosMensuales(fechaActual);
    renderizarGastos(); renderizarIngresos(); actualizarTotales();
    const modalHTML = `
      <div id="modalExitoLiquidacion" style="display:flex;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;">
        <div style="background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);text-align:center;max-width:420px;">
          <div style="color:#28a745;font-size:48px;margin-bottom:16px;">✓</div>
          <h3 style="margin:0 0 12px 0;color:#333;">Liquidación generada</h3>
          <p style="margin:0 0 18px 0;color:#666;">La liquidación del mes seleccionado se generó correctamente y el mes quedó cerrado.</p>
          <button id="btnCerrarModalLiquidacion" class="button-primary" style="min-width:120px;">Aceptar</button>
        </div>
      </div>`;
    const modalContainer = document.createElement('div'); modalContainer.innerHTML = modalHTML; document.body.appendChild(modalContainer.firstElementChild);
    setTimeout(() => {
      const btn = document.getElementById('btnCerrarModalLiquidacion');
      if (btn) { btn.focus(); btn.onclick = () => { const m = document.getElementById('modalExitoLiquidacion'); if (m) m.remove(); }; }
    }, 100);
  };
}



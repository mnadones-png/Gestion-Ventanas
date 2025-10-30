export async function showHistorialLiquidacion() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h2>Historial de Liquidaciones Mensuales</h2>
    <div style="display:flex;gap:12px;align-items:end;margin-bottom:16px;flex-wrap:wrap;">
      <div>
        <label for="selectMes">Mes</label>
        <select id="selectMes"></select>
      </div>
      <div>
        <label for="selectYear">Año</label>
        <select id="selectYear"></select>
      </div>
      <div>
        <button id="btnBuscarLiquidacion" class="button-primary">Buscar</button>
      </div>
    </div>
    <div id="listaLiquidaciones"></div>
  `;

  const liquidaciones = await window.api.getLiquidaciones();
  const container = document.getElementById('listaLiquidaciones');
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const selectMes = document.getElementById('selectMes');
  selectMes.innerHTML = meses.map((m, idx) => `<option value="${idx}">${m}</option>`).join('');
  const selectYear = document.getElementById('selectYear');
  const YEAR_MIN = 2025, YEAR_MAX = 2040;
  const currentYear = new Date().getFullYear();
  let minYear = YEAR_MIN;
  if (liquidaciones && liquidaciones.length > 0) {
    const minFromData = Math.min(...liquidaciones.map(l => new Date(l.fecha).getFullYear()));
    minYear = Math.max(YEAR_MIN, Math.min(minFromData, YEAR_MAX));
  }
  let yearsHtml = '';
  for (let y = minYear; y <= YEAR_MAX; y++) yearsHtml += `<option value="${y}">${y}</option>`;
  selectYear.innerHTML = yearsHtml;

  function renderListFor(monthIndex, year) {
    container.innerHTML = '';
    const filtered = liquidaciones.filter(liq => {
      const d = new Date(liq.fecha);
      return d.getMonth() === Number(monthIndex) && d.getFullYear() === Number(year);
    });
    if (filtered.length === 0) { container.innerHTML = '<p>No hay liquidaciones registradas para el mes seleccionado.</p>'; return; }
    filtered.forEach(liq => {
      const fecha = new Date(liq.fecha).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      const div = document.createElement('div');
      div.className = 'liquidacion-card';
      div.innerHTML = `
        <div class="liquidacion-header">
          <h3>Liquidación de ${fecha}</h3>
          <span class="utilidad-badge ${liq.utilidad >= 0 ? 'positiva' : 'negativa'}">
            ${liq.utilidad >= 0 ? 'Ganancia' : 'Pérdida'}: $${Math.abs(liq.utilidad).toLocaleString()}
          </span>
        </div>
        <div class="liquidacion-resumen">
          <div class="resumen-item"><span>Total Ingresos:</span><span class="monto">$${liq.ingresos.toLocaleString()}</span></div>
          <div class="resumen-item"><span>Total Gastos:</span><span class="monto">$${liq.gastos.toLocaleString()}</span></div>
        </div>
        <div class="liquidacion-detalles">
          <div class="detalle-ingresos">
            <h4>Detalle de Ingresos</h4>
            <table class="table">
              <thead><tr><th>Fecha</th><th>Cliente</th><th>Concepto</th><th>Monto</th></tr></thead>
              <tbody>
                ${liq.detalleIngresos.map(i => `
                  <tr><td>${new Date(i.fecha).toLocaleDateString()}</td><td>${i.cliente}</td><td>${i.concepto}</td><td>$${i.monto.toLocaleString()}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="detalle-gastos">
            <h4>Detalle de Gastos</h4>
            <table class="table">
              <thead><tr><th>Fecha</th><th>Concepto</th><th>Monto</th></tr></thead>
              <tbody>
                ${liq.detalleGastos.map(g => `
                  <tr><td>${new Date(g.fecha).toLocaleDateString()}</td><td>${g.concepto}</td><td>$${g.monto.toLocaleString()}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
      container.appendChild(div);
    });
  }

  selectMes.value = new Date().getMonth();
  selectYear.value = currentYear;
  renderListFor(selectMes.value, selectYear.value);
  document.getElementById('btnBuscarLiquidacion').onclick = function() { renderListFor(selectMes.value, selectYear.value); };
}



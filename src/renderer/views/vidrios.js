import { showInAppAlert, showInAppConfirm } from '../modals.js';

export function showTiposVidrio() {
  const content = document.getElementById('content');
  const tiposVidrio = window.tiposVidrio || [];
  content.innerHTML = `
    <h2>Tipos de Vidrios</h2>
    <form id="vidrioForm" style="max-width:600px;">
      <table class="table">
        <thead><tr><th>Nombre</th><th>Costo</th><th>m2 Costo</th><th>m2 Venta</th><th>Acciones</th></tr></thead>
        <tbody id="vidrioTbody"></tbody>
      </table>
      <h3>Agregar nuevo vidrio</h3>
      <input type="text" id="nuevoNombreVidrio" placeholder="Nombre" required>
      <input type="number" id="nuevoCostoVidrio" placeholder="Costo" min="0" required>
      <input type="number" id="nuevoMCostoVidrio" placeholder="m2 Costo" min="0" required>
      <input type="number" id="nuevoMVentaVidrio" placeholder="m2 Venta" min="0" required>
      <button type="button" class="button-primary" id="agregarVidrio">Agregar Vidrio</button>
    </form>
  `;

  function renderVidrios() {
    const tbody = document.getElementById('vidrioTbody');
    tbody.innerHTML = tiposVidrio.map((v, idx) => `
      <tr>
        <td><input type="text" value="${v.nombre}" onchange="window.updateVidrio(${idx}, 'nombre', this.value)"></td>
        <td><input type="number" value="${v.costo}" min="0" onchange="window.updateVidrio(${idx}, 'costo', this.value)"></td>
        <td><input type="number" value="${v.mcosto}" min="0" onchange="window.updateVidrio(${idx}, 'mcosto', this.value)"></td>
        <td><input type="number" value="${v.mventa}" min="0" onchange="window.updateVidrio(${idx}, 'mventa', this.value)"></td>
        <td><button type="button" onclick="window.eliminarVidrio(${idx})">Eliminar</button></td>
      </tr>
    `).join('');
  }

  window.updateVidrio = (idx, key, value) => {
    const tv = window.tiposVidrio || [];
    tv[idx][key] = key === 'nombre' ? value : parseFloat(value);
    window.tiposVidrio = tv;
    renderVidrios();
  };

  window.eliminarVidrio = async (idx) => {
    const ok = await showInAppConfirm('Eliminar vidrio', '¿Desea eliminar este vidrio? Esta acción no se puede deshacer.');
    if (!ok) return;
    const tv = window.tiposVidrio || [];
    tv.splice(idx, 1);
    window.tiposVidrio = tv;
    renderVidrios();
  };

  document.getElementById('agregarVidrio').onclick = async () => {
    const nombre = document.getElementById('nuevoNombreVidrio').value;
    const costo = parseFloat(document.getElementById('nuevoCostoVidrio').value);
    const mcosto = parseFloat(document.getElementById('nuevoMCostoVidrio').value);
    const mventa = parseFloat(document.getElementById('nuevoMVentaVidrio').value);
    if (!nombre || isNaN(costo) || isNaN(mcosto) || isNaN(mventa)) {
      await showInAppAlert('Aviso', 'Completa todos los campos');
      return;
    }
    const tv = window.tiposVidrio || [];
    tv.push({ nombre, costo, mcosto, mventa });
    window.tiposVidrio = tv;
    renderVidrios();
    document.getElementById('nuevoNombreVidrio').value = '';
    document.getElementById('nuevoCostoVidrio').value = '';
    document.getElementById('nuevoMCostoVidrio').value = '';
    document.getElementById('nuevoMVentaVidrio').value = '';
  };

  renderVidrios();
}



import { showInAppAlert, showInAppConfirm } from '../modals.js';

export async function showCalculoRapido() {
  const content = document.getElementById('content');
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  const tiposVidrio = window.tiposVidrio || [];
  tempDiv.innerHTML = `
    <h2>Cálculo de Vidrio</h2>
    <form id="calculoRapidoForm">
      <label>Nombre del cliente</label>
      <input type="text" id="clienteNombre">
      <label>RUT</label>
      <input type="text" id="clienteRUT">
      <label>Número de teléfono</label>
      <input type="tel" id="clienteTelefono">
      <label>Correo</label>
      <input type="email" id="clienteCorreo">
      <label>Tipo de vidrio</label>
      <select id="tipoVidrio">${tiposVidrio.map((v, idx) => `<option value="${idx}">${v.nombre}</option>`).join('')}</select>
      <label>Medidas (ancho x alto en metros)</label>
      <input type="number" id="ancho" step="0.01" min="0.1" placeholder="Ancho" required>
      <input type="number" id="alto" step="0.01" min="0.1" placeholder="Alto" required>
      <label>Cantidad</label>
      <input type="number" id="cantidad" step="1" min="1" value="1" placeholder="Cantidad" required>
      <button class="button-primary" type="submit">Calcular</button>
    </form>
    <div id="resultadoCalculo"></div>
    <div id="modalAgregarVentana" style="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:9999;align-items:center;justify-content:center;">
      <div style="background:#fff;padding:30px 20px;border-radius:8px;box-shadow:0 2px 10px #222;max-width:350px;margin:auto;text-align:center;">
        <h3>¿Desea calcular otro vidrio?</h3>
        <button id="btnAgregarVentanaSi" class="button-primary" style="margin-right:10px;">Sí</button>
        <button id="btnAgregarVentanaNo" class="button-primary">No</button>
      </div>
    </div>
  `;
  while (tempDiv.firstChild) fragment.appendChild(tempDiv.firstChild);
  content.innerHTML = '';
  content.appendChild(fragment);

  document.getElementById('calculoRapidoForm').onsubmit = async function(e) {
    e.preventDefault();
    const cliente_nombre = document.getElementById('clienteNombre').value;
    const cliente_rut = document.getElementById('clienteRUT').value;
    const cliente_telefono = document.getElementById('clienteTelefono').value;
    const cliente_correo = document.getElementById('clienteCorreo').value;
    const ancho = parseFloat(document.getElementById('ancho').value);
    const alto = parseFloat(document.getElementById('alto').value);
    const cantidad = Math.max(1, parseInt(document.getElementById('cantidad').value || '1', 10));
    const vidIdx = document.getElementById('tipoVidrio').value;
    const vidrio = (window.tiposVidrio || [])[vidIdx];
    const area = ancho * alto;

    const costoPorM2 = vidrio.mcosto || vidrio.costo;
    const costoUnitario = costoPorM2 * area;
    const costoTotal = costoUnitario * cantidad;
    const precioVentaUnitario = costoUnitario * 2;
    const precioVenta = precioVentaUnitario * cantidad;

    const aplicaIva = await showInAppConfirm('IVA', '¿Desea agregar IVA al precio final?');
    const ivaUnitario = aplicaIva ? precioVentaUnitario * 0.19 : 0;
    const iva = ivaUnitario * cantidad;
    const precioFinal = precioVenta + iva;

    const areaFormateada = area.toString().includes('.') ? area.toFixed(3) : area.toString();
    document.getElementById('resultadoCalculo').innerHTML = `
      <div class="calculo-resumen" style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
        <h3>Resumen del cálculo</h3>
        <table class="table">
          <tr><td><strong>Cliente:</strong></td><td>${cliente_nombre}</td></tr>
          <tr><td><strong>RUT:</strong></td><td>${cliente_rut}</td></tr>
          ${cliente_telefono ? `<tr><td><strong>Teléfono:</strong></td><td>${cliente_telefono}</td></tr>` : ''}
          ${cliente_correo ? `<tr><td><strong>Correo:</strong></td><td>${cliente_correo}</td></tr>` : ''}
          <tr><td><strong>Tipo de vidrio:</strong></td><td>${vidrio.nombre}</td></tr>
          <tr><td><strong>Medidas:</strong></td><td>${ancho} x ${alto} metros</td></tr>
          <tr><td><strong>Área por unidad:</strong></td><td>${areaFormateada} m²</td></tr>
          <tr><td><strong>Cantidad:</strong></td><td>${cantidad}</td></tr>
          <tr><td><strong>Precio por m²:</strong></td><td>$${costoPorM2.toLocaleString()}</td></tr>
          <tr><td><strong>Costo unitario:</strong></td><td>$${Math.round(costoUnitario).toLocaleString()}</td></tr>
          <tr><td><strong>Costo total:</strong></td><td>$${Math.round(costoTotal).toLocaleString()}</td></tr>
          <tr><td><strong>Precio venta total:</strong></td><td>$${Math.round(precioVenta).toLocaleString()}</td></tr>
          <tr><td><strong>IVA (19%):</strong></td><td>$${Math.round(iva).toLocaleString()}</td></tr>
          <tr><td><strong>Precio final:</strong></td><td style="font-weight: bold; color: #2d3436; font-size: 1.1em;">$${Math.round(precioFinal).toLocaleString()}</td></tr>
        </table>
      </div>
    `;

    await window.api.addPresupuesto({
      cliente_nombre,
      cliente_rut,
      cliente_telefono: cliente_telefono && cliente_telefono.trim() !== '' ? cliente_telefono.trim() : null,
      cliente_correo: cliente_correo && cliente_correo.trim() !== '' ? cliente_correo.trim() : null,
      tipo_vidrio_idx: Number(vidIdx),
      ancho,
      alto,
      total: Number(costoTotal),
      aplica_iva: aplicaIva ? 1 : 0,
      precio_final: Number(precioFinal),
      fecha: new Date().toLocaleString(),
      descripcion: `Cálculo de vidrio: ${vidrio.nombre} x${cantidad}`
    });

    const modal = document.getElementById('modalAgregarVentana');
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('btnAgregarVentanaSi').focus(), 100);
    document.getElementById('btnAgregarVentanaSi').onclick = function() {
      modal.style.display = 'none';
      document.getElementById('calculoRapidoForm').reset();
      document.getElementById('resultadoCalculo').innerHTML = '';
      document.getElementById('clienteNombre').focus();
    };
    document.getElementById('btnAgregarVentanaNo').onclick = function() {
      modal.style.display = 'none';
      const modalHTML = `
        <div id="modalExito" style="display:flex;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;">
          <div style=\"background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);text-align:center;max-width:400px;\"> 
            <div style=\"color:#28a745;font-size:48px;margin-bottom:20px;\">✓</div>
            <h3 style=\"margin:0 0 20px 0;color:#333;\">¡Éxito!</h3>
            <p style=\"margin:0 0 20px 0;color:#666;\">Presupuesto guardado correctamente</p>
            <button id=\"btnCerrarModalExito\" class=\"button-primary\" style=\"min-width:120px;\">Aceptar</button>
          </div>
        </div>`;
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHTML;
      document.body.appendChild(modalContainer.firstElementChild);
      setTimeout(() => {
        const btnCerrar = document.getElementById('btnCerrarModalExito');
        btnCerrar.focus();
        btnCerrar.onclick = () => {
          document.getElementById('modalExito').remove();
          document.getElementById('resultadoCalculo').innerHTML += '<p>Presupuesto guardado correctamente.</p>';
        };
      }, 100);
    };
  };
}



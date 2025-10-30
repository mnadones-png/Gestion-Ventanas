import { showInAppAlert, showInAppConfirm } from '../modals.js';
import { materialesPorDimension, cargarMaterialesDimension } from '../materiales.js';

export async function showPresupuesto() {
  const content = document.getElementById('content');
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = `
    <h2>Crear Presupuesto</h2>
    <form id="presupuestoForm">
      <label>Nombre del cliente</label>
      <input type="text" id="clienteNombre">
      <label>RUT</label>
      <input type="text" id="clienteRUT">
      <label>Número de teléfono</label>
      <input type="tel" id="clienteTelefono">
      <label>Correo</label>
      <input type="email" id="clienteCorreo">
      <label>Tipo de ventana</label>
      <select id="tipoVentana"></select>
      <label>Tipo de vidrio (opcional)</label>
      <select id="tipoVidrio">
        <option value="">-- Ninguno --</option>
      </select>
      <label>Medidas (ancho x alto en metros)</label>
      <input type="number" id="ancho" step="0.01" min="0.1" placeholder="Ancho">
      <input type="number" id="alto" step="0.01" min="0.1" placeholder="Alto">
      <label>Cantidad</label>
      <input type="number" id="cantidadVentana" step="1" min="1" value="1" placeholder="Cantidad">
      <label>Descripción</label>
      <textarea id="descripcion" rows="3" placeholder="Descripción del presupuesto"></textarea>
      <button class="button-primary" type="submit">Calcular y Guardar Presupuesto</button>
    </form>
    <div id="resultadoPresupuesto"></div>
    <div id="modalAgregarVentana" style="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:9999;align-items:center;justify-content:center;">
      <div style="background:#fff;padding:30px 20px;border-radius:8px;box-shadow:0 2px 10px #222;max-width:350px;margin:auto;text-align:center;">
        <h3>¿Desea agregar otra ventana?</h3>
        <button id="btnAgregarVentanaSi" class="button-primary" style="margin-right:10px;">Sí</button>
        <button id="btnAgregarVentanaNo" class="button-primary">No</button>
      </div>
    </div>
  `;
  while (tempDiv.firstChild) fragment.appendChild(tempDiv.firstChild);
  content.innerHTML = '';
  content.appendChild(fragment);
  await cargarTiposVentana();
  document.getElementById('presupuestoForm').onsubmit = calcularYGuardarPresupuesto;
}

async function cargarTiposVentana() {
  const tipos = await window.api.getTiposVentana();
  const select = document.getElementById('tipoVentana');
  select.innerHTML = tipos.map((t) => `<option value="${t.id}">${t.nombre}</option>`).join('');
  const selectVidrio = document.getElementById('tipoVidrio');
  if (selectVidrio) {
    const tv = window.tiposVidrio || [];
    selectVidrio.innerHTML = '<option value="">-- Ninguno --</option>' + tv.map((v, idx) => `<option value="${idx}">${v.nombre}</option>`).join('');
  }
}

async function calcularYGuardarPresupuesto(e) {
  e.preventDefault();
  try {
    const materialesCargados = await cargarMaterialesDimension();
    if (!materialesCargados) {
      await showInAppAlert('Error', 'No se pudieron cargar los materiales necesarios para el cálculo.');
      return;
    }
  } catch (error) {
    await showInAppAlert('Error', 'No se pudieron cargar los materiales necesarios para el cálculo.');
    return;
  }

  const cliente_nombre = document.getElementById('clienteNombre').value;
  const cliente_rut = document.getElementById('clienteRUT').value;
  const cliente_telefono = document.getElementById('clienteTelefono').value;
  const cliente_correo = document.getElementById('clienteCorreo').value;
  const tipo_ventana_id = parseInt(document.getElementById('tipoVentana').value);
  const ancho = parseFloat(document.getElementById('ancho').value);
  const alto = parseFloat(document.getElementById('alto').value);
  const cantidadVentana = Math.max(1, parseInt((document.getElementById('cantidadVentana') && document.getElementById('cantidadVentana').value) ? document.getElementById('cantidadVentana').value : '1', 10));
  const tipos = await window.api.getTiposVentana();
  const tipo = tipos.find(t => t.id === tipo_ventana_id);

  let totalCosto = 0;
  let desgloseHTML = '<table class="table"><thead><tr><th>Material</th><th>Tipo</th><th>Precio unitario</th><th>Cantidad</th><th>Subtotal</th></tr></thead><tbody>';
  const aplicaIva = await showInAppConfirm('IVA', '¿Desea agregar IVA al precio final?');

  if (tipo && tipo.materiales) {
    tipo.materiales.forEach(mat => {
      let subtotal = 0;
      if (mat.tipo === 'Aluminio') {
        const porAncho = materialesPorDimension.porAncho;
        const porAlto = materialesPorDimension.porAlto;
        if (porAncho.includes(mat.nombre.toLowerCase())) {
          subtotal = (mat.precio / 6) * mat.cantidad * ancho;
        } else if (porAlto.includes(mat.nombre.toLowerCase())) {
          subtotal = (mat.precio / 6) * mat.cantidad * alto;
        } else {
          subtotal = (mat.precio / 6) * mat.cantidad * ancho * alto;
        }
      } else if (mat.tipo === 'Quincalleria') {
        if (mat.nombre && mat.nombre.toLowerCase().includes('silicona')) {
          subtotal = (mat.precio / 6) * mat.cantidad;
        } else {
          subtotal = mat.precio * mat.cantidad;
        }
      } else if (mat.tipo === 'Vidrio') {
        const selectedVidrioIdx = document.getElementById('tipoVidrio') ? document.getElementById('tipoVidrio').value : '';
        const area = ancho * alto;
        const tv = window.tiposVidrio || [];
        if (selectedVidrioIdx !== '' && tv[selectedVidrioIdx]) {
          const vid = tv[selectedVidrioIdx];
          const costoVidrio = (vid.mcosto || vid.costo) * area;
          subtotal = costoVidrio * mat.cantidad;
        } else {
          subtotal = mat.precio * mat.cantidad * area;
        }
      }
      totalCosto += subtotal;
      desgloseHTML += `<tr><td>${mat.nombre}</td><td>${mat.tipo}</td><td>$${mat.precio.toLocaleString()}</td><td>${mat.cantidad}</td><td>$${Math.round(subtotal).toLocaleString()}</td></tr>`;
    });
    const selectedVid = document.getElementById('tipoVidrio') ? document.getElementById('tipoVidrio').value : '';
    const hasVidMat = tipo.materiales.some(m => m.tipo === 'Vidrio');
    const tv = window.tiposVidrio || [];
    if (selectedVid !== '' && tv[selectedVid] && !hasVidMat) {
      const vid = tv[selectedVid];
      const areaV = ancho * alto;
      const costoVid = (vid.mcosto || vid.costo) * areaV;
      totalCosto += costoVid;
      desgloseHTML += '<tr><td>Vidrio - ' + vid.nombre + '</td><td>Vidrio</td><td>$' + Math.round(vid.mcosto || vid.costo).toLocaleString() + '</td><td>1</td><td>$' + Math.round(costoVid).toLocaleString() + '</td></tr>';
    }
  }
  desgloseHTML += '</tbody></table>';

  const costoUnitarioVentana = totalCosto;
  const totalCostoMultiplicado = costoUnitarioVentana * cantidadVentana;
  const precioVentaUnitario = costoUnitarioVentana * 2;
  const precioVenta = precioVentaUnitario * cantidadVentana;
  const iva = (aplicaIva ? precioVenta * 0.19 : 0);
  const precioFinal = precioVenta + iva;
  document.getElementById('resultadoPresupuesto').innerHTML = `
    <h3>Desglose de materiales</h3>
    <p><strong>Cantidad de ventanas:</strong> ${cantidadVentana}</p>
    ${desgloseHTML}
    <h3>Precio costo total: $${Math.round(totalCostoMultiplicado).toLocaleString()}</h3>
    <h3>Precio venta: $${Math.round(precioVenta).toLocaleString()}</h3>
    <h3>IVA (19%): $${Math.round(iva).toLocaleString()}</h3>
    <h3>Precio final: $${Math.round(precioFinal).toLocaleString()}</h3>
  `;

  const tipoVidVal = document.getElementById('tipoVidrio') ? document.getElementById('tipoVidrio').value : '';
  await window.api.addPresupuesto({
    cliente_nombre,
    cliente_rut,
    cliente_telefono: cliente_telefono && cliente_telefono.trim() !== '' ? cliente_telefono.trim() : null,
    cliente_correo: cliente_correo && cliente_correo.trim() !== '' ? cliente_correo.trim() : null,
    tipo_ventana_id,
    tipo_vidrio_idx: tipoVidVal !== '' ? Number(tipoVidVal) : null,
    ancho,
    alto,
    total: Number(Math.round(totalCostoMultiplicado)),
    aplica_iva: aplicaIva ? 1 : 0,
    precio_final: Number(Math.round(precioFinal)),
    fecha: new Date().toLocaleString(),
    descripcion: (document.getElementById('descripcion') && document.getElementById('descripcion').value ? document.getElementById('descripcion').value + ' ' : '') + `(x${cantidadVentana})`
  });

  const modal = document.getElementById('modalAgregarVentana');
  modal.style.display = 'flex';
  setTimeout(() => document.getElementById('btnAgregarVentanaSi').focus(), 100);
  document.getElementById('btnAgregarVentanaSi').onclick = function() {
    modal.style.display = 'none';
    document.getElementById('presupuestoForm').reset();
    document.getElementById('clienteNombre').focus();
    document.getElementById('resultadoPresupuesto').innerHTML = '';
  };
  document.getElementById('btnAgregarVentanaNo').onclick = function() {
    modal.style.display = 'none';
    const modalHTML = `
      <div id="modalExito" style="display:flex;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;">
        <div style="background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);text-align:center;max-width:400px;">
          <div style="color:#28a745;font-size:48px;margin-bottom:20px;">✓</div>
          <h3 style="margin:0 0 20px 0;color:#333;">¡Éxito!</h3>
          <p style="margin:0 0 20px 0;color:#666;">Presupuesto guardado correctamente</p>
          <button id="btnCerrarModalExito" class="button-primary" style="min-width:120px;">Aceptar</button>
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
        document.getElementById('resultadoPresupuesto').innerHTML = '<p>Presupuesto guardado correctamente.</p>';
      };
    }, 100);
  };
}



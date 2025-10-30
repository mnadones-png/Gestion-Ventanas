export async function showClientes() {
  const content = document.getElementById('content');
  content.innerHTML = `<h2>Clientes</h2>
    <input type="text" id="buscarCliente" placeholder="Buscar por nombre, rut o correo" style="margin-bottom:10px;width:300px;">
    <table class="table" id="tablaClientes">
      <thead><tr><th>Nombre</th><th>RUT</th><th>Correo</th><th>Teléfono</th><th>Acciones</th></tr></thead>
      <tbody></tbody>
    </table>
    <div id="presupuestosCliente"></div>`;

  async function cargarYRenderizarClientes() {
    const clientes = await window.api.getClientes();
    renderTablaClientes(clientes);
  }

  function renderTablaClientes(filtrados) {
    const tbody = document.querySelector('#tablaClientes tbody');
    const fragment = document.createDocumentFragment();
    filtrados.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${c.nombre}</td>
        <td>${c.rut}</td>
        <td>${c.correo}</td>
        <td>${c.telefono}</td>
        <td><button type="button" class="button-primary" onclick="window.verPresupuestosCliente(${c.id})">Ver presupuestos</button></td>`;
      fragment.appendChild(tr);
    });
    tbody.innerHTML = '';
    tbody.appendChild(fragment);
  }

  await cargarYRenderizarClientes();

  document.getElementById('buscarCliente').addEventListener('input', async function() {
    const q = this.value.toLowerCase();
    const clientes = await window.api.getClientes();
    const filtrados = clientes.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.rut.toLowerCase().includes(q) ||
      c.correo.toLowerCase().includes(q) ||
      (c.telefono ? c.telefono.toLowerCase().includes(q) : false)
    );
    renderTablaClientes(filtrados);
  });

  window.verPresupuestosCliente = async function(clienteId) {
    const [presupuestos, tipos] = await Promise.all([
      window.api.getPresupuestosPorCliente(clienteId),
      window.api.getTiposVentana()
    ]);
    let html = `<h3>Presupuestos de este cliente</h3>`;
    html += `<input type="text" id="filterPresupuestosCliente" placeholder="Filtrar presupuestos por tipo, fecha o medidas" style="margin-bottom:10px;width:100%;">`;
    if (presupuestos.length === 0) {
      html += '<p>No hay presupuestos para este cliente.</p>';
    } else {
      html += `
        <div class="presupuestos-grid">
          ${presupuestos.map(p => {
            const tipo = tipos.find(t => t.id === p.tipo_ventana_id);
            let totalCosto = 0;
            let desgloseHTML = '';
            if (tipo && tipo.materiales) {
              desgloseHTML = `
                <table class="table materiales-table">
                  <thead>
                    <tr>
                      <th>Material</th><th>Tipo</th><th>Precio unitario</th><th>Cantidad</th><th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>`;
              tipo.materiales.forEach(mat => {
                let subtotal = 0;
                if (mat.tipo === 'Aluminio') {
                  const porAncho = window.MATERIALES_POR_DIMENSION ? window.MATERIALES_POR_DIMENSION.porAncho : [];
                  const porAlto = window.MATERIALES_POR_DIMENSION ? window.MATERIALES_POR_DIMENSION.porAlto : [];
                  if (porAncho.includes(mat.nombre.toLowerCase())) subtotal = (mat.precio / 6) * mat.cantidad * p.ancho;
                  else if (porAlto.includes(mat.nombre.toLowerCase())) subtotal = (mat.precio / 6) * mat.cantidad * p.alto;
                  else subtotal = (mat.precio / 6) * mat.cantidad * p.ancho * p.alto;
                } else if (mat.tipo === 'Quincalleria') {
                  if (mat.nombre && mat.nombre.toLowerCase().includes('silicona')) subtotal = (mat.precio / 6) * mat.cantidad;
                  else subtotal = mat.precio * mat.cantidad;
                } else if (mat.tipo === 'Vidrio') {
                  const vidIdx = typeof p.tipo_vidrio_idx !== 'undefined' && p.tipo_vidrio_idx !== null ? p.tipo_vidrio_idx : '';
                  const areaP = p.ancho * p.alto;
                  if (vidIdx !== '' && (window.tiposVidrio || [])[vidIdx]) {
                    const v = (window.tiposVidrio || [])[vidIdx];
                    const costoVid = (v.mcosto || v.costo) * areaP;
                    subtotal = costoVid * mat.cantidad;
                  } else subtotal = mat.precio * mat.cantidad * p.ancho * p.alto;
                }
                totalCosto += subtotal;
                desgloseHTML += `
                  <tr>
                    <td>${mat.nombre}</td><td>${mat.tipo}</td><td>$${Math.round(mat.precio).toLocaleString()}</td><td>${mat.cantidad}</td><td>$${Math.round(subtotal).toLocaleString()}</td>
                  </tr>`;
              });
              desgloseHTML += '</tbody></table>';
            }
            let vidrioNombre = '';
            let vidrioDetailsHTML = '';
            const vidIdxP = typeof p.tipo_vidrio_idx !== 'undefined' && p.tipo_vidrio_idx !== null ? p.tipo_vidrio_idx : '';
            const areaP = p.ancho * p.alto;
            const hasVidMatP = tipo && tipo.materiales ? tipo.materiales.some(m => m.tipo === 'Vidrio') : false;
            if (vidIdxP !== '' && (window.tiposVidrio || [])[vidIdxP] && !hasVidMatP) {
              const v = (window.tiposVidrio || [])[vidIdxP];
              const unitM2 = (v.mcosto || v.costo);
              const costoVid = unitM2 * areaP;
              totalCosto += costoVid;
              desgloseHTML += '<tr><td>Vidrio - ' + v.nombre + '</td><td>Vidrio</td><td>$' + unitM2.toLocaleString() + '</td><td>1</td><td>$' + Math.round(costoVid).toLocaleString() + '</td></tr>';
              vidrioNombre = v.nombre;
              vidrioDetailsHTML = '<p class="vidrio-info"><small>Precio por m²: $' + unitM2.toLocaleString() + ' | Área: ' + areaP.toFixed(3) + ' m² | Cantidad: 1 | Subtotal: $' + Math.round(costoVid).toLocaleString() + '</small></p>';
            }
            const precioVenta = totalCosto * 2;
            const persistedPrecioFinal = typeof p.precio_final !== 'undefined' && p.precio_final !== null ? Number(p.precio_final) : null;
            const persistedAplicaIva = typeof p.aplica_iva !== 'undefined' && p.aplica_iva !== null ? Boolean(p.aplica_iva) : null;
            const iva = persistedAplicaIva === null ? (precioVenta * 0.19) : (persistedAplicaIva ? (precioVenta * 0.19) : 0);
            const precioFinal = persistedPrecioFinal !== null ? persistedPrecioFinal : (precioVenta + iva);
            return `
              <div class="presupuesto-card">
                <div class="presupuesto-header">
                  <h4>Presupuesto del ${p.fecha}</h4>
                  <span class="tipo-ventana">${tipo ? tipo.nombre : 'Tipo no disponible'}</span>
                </div>
                <div class="presupuesto-body">
                  <div class="info-general">
                    <p><strong>Medidas:</strong> ${p.ancho} x ${p.alto} metros</p>
                    ${vidrioNombre ? (`<p><strong>Vidrio:</strong> ${vidrioNombre}</p>` + vidrioDetailsHTML) : ''}
                    <p><strong>Precio costo:</strong> $${Math.round(totalCosto).toLocaleString()}</p>
                    <p><strong>Precio venta:</strong> $${Math.round(precioVenta).toLocaleString()}</p>
                    <p><strong>IVA (19%):</strong> $${Math.round(iva).toLocaleString()}</p>
                    <p><strong>Precio final:</strong> $${Math.round(precioFinal).toLocaleString()}</p>
                  </div>
                  <div class="desglose-materiales">
                    <h5>Desglose de materiales</h5>
                    ${desgloseHTML}
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>`;
    }
    document.getElementById('presupuestosCliente').innerHTML = html;
    document.getElementById('filterPresupuestosCliente').addEventListener('input', function() {
      const filterQuery = this.value.toLowerCase();
      const filtered = presupuestos.filter(p => {
        const tipo = tipos.find(t => t.id === p.tipo_ventana_id);
        return (
          (tipo && tipo.nombre.toLowerCase().includes(filterQuery)) ||
          p.fecha.toLowerCase().includes(filterQuery) ||
          (`${p.ancho} x ${p.alto}`).toLowerCase().includes(filterQuery)
        );
      });
      const container = document.getElementById('presupuestosCliente');
      if (filtered.length === 0) {
        container.querySelector('.presupuestos-grid') ? container.querySelector('.presupuestos-grid').innerHTML = '<p>No hay presupuestos que coincidan con el filtro.</p>' : null;
      } else {
        container.querySelector('.presupuestos-grid').innerHTML = filtered.map(p => {
          const tipo = tipos.find(t => t.id === p.tipo_ventana_id);
          let totalCosto = 0;
          let desgloseHTML = '';
          if (tipo && tipo.materiales) {
            desgloseHTML = '<table class="table materiales-table"><thead><tr><th>Material</th><th>Tipo</th><th>Precio unitario</th><th>Cantidad</th><th>Subtotal</th></tr></thead><tbody>';
            tipo.materiales.forEach(mat => {
              let subtotal = 0;
              if (mat.tipo === 'Aluminio') {
                const porAncho = window.MATERIALES_POR_DIMENSION ? window.MATERIALES_POR_DIMENSION.porAncho : [];
                const porAlto = window.MATERIALES_POR_DIMENSION ? window.MATERIALES_POR_DIMENSION.porAlto : [];
                if (porAncho.includes(mat.nombre.toLowerCase())) subtotal = (mat.precio / 6) * mat.cantidad * p.ancho;
                else if (porAlto.includes(mat.nombre.toLowerCase())) subtotal = (mat.precio / 6) * mat.cantidad * p.alto;
                else subtotal = (mat.precio / 6) * mat.cantidad * p.ancho * p.alto;
              } else if (mat.tipo === 'Quincalleria') {
                if (mat.nombre && mat.nombre.toLowerCase().includes('silicona')) subtotal = (mat.precio / 6) * mat.cantidad;
                else subtotal = mat.precio * mat.cantidad;
              } else if (mat.tipo === 'Vidrio') {
                const vidIdx = typeof p.tipo_vidrio_idx !== 'undefined' && p.tipo_vidrio_idx !== null ? p.tipo_vidrio_idx : '';
                const areaP = p.ancho * p.alto;
                if (vidIdx !== '' && (window.tiposVidrio || [])[vidIdx]) {
                  const v2 = (window.tiposVidrio || [])[vidIdx];
                  const costoVid2 = (v2.mcosto || v2.costo) * areaP;
                  subtotal = costoVid2 * mat.cantidad;
                } else subtotal = mat.precio * mat.cantidad * p.ancho * p.alto;
              }
              totalCosto += subtotal;
              desgloseHTML += `<tr><td>${mat.nombre}</td><td>${mat.tipo}</td><td>$${Math.round(mat.precio).toLocaleString()}</td><td>${mat.cantidad}</td><td>$${Math.round(subtotal).toLocaleString()}</td></tr>`;
            });
            desgloseHTML += '</tbody></table>';
          }
          let vidrioNombreF = '';
          let vidrioDetailsHTMLF = '';
          const vidIdxF = typeof p.tipo_vidrio_idx !== 'undefined' && p.tipo_vidrio_idx !== null ? p.tipo_vidrio_idx : '';
          const areaF = p.ancho * p.alto;
          const hasVidMatF = tipo && tipo.materiales ? tipo.materiales.some(m => m.tipo === 'Vidrio') : false;
          if (vidIdxF !== '' && (window.tiposVidrio || [])[vidIdxF] && !hasVidMatF) {
            const vf = (window.tiposVidrio || [])[vidIdxF];
            const unitM2F = (vf.mcosto || vf.costo);
            const costoVidF = unitM2F * areaF;
            totalCosto += costoVidF;
            desgloseHTML += '<tr><td>Vidrio - ' + vf.nombre + '</td><td>Vidrio</td><td>$' + unitM2F.toLocaleString() + '</td><td>1</td><td>$' + Math.round(costoVidF).toLocaleString() + '</td></tr>';
            vidrioNombreF = vf.nombre;
            vidrioDetailsHTMLF = '<p class="vidrio-info"><small>Precio por m²: $' + unitM2F.toLocaleString() + ' | Área: ' + areaF.toFixed(3) + ' m² | Cantidad: 1 | Subtotal: $' + Math.round(costoVidF).toLocaleString() + '</small></p>';
          }
          const precioVenta = totalCosto * 2;
          const persistedPrecioFinalF = typeof p.precio_final !== 'undefined' && p.precio_final !== null ? Number(p.precio_final) : null;
          const persistedAplicaIvaF = typeof p.aplica_iva !== 'undefined' && p.aplica_iva !== null ? Boolean(p.aplica_iva) : null;
          const ivaF = persistedAplicaIvaF === null ? (precioVenta * 0.19) : (persistedAplicaIvaF ? (precioVenta * 0.19) : 0);
          const precioFinal = persistedPrecioFinalF !== null ? persistedPrecioFinalF : (precioVenta + ivaF);
          return `<div class="presupuesto-card"><div class="presupuesto-header"><h4>Presupuesto del ${p.fecha}</h4><span class="tipo-ventana">${tipo ? tipo.nombre : 'Tipo no disponible'}</span></div><div class="presupuesto-body"><div class="info-general"><p><strong>Medidas:</strong> ${p.ancho} x ${p.alto} metros</p>${vidrioNombreF ? (`<p><strong>Vidrio:</strong> ${vidrioNombreF}</p>` + vidrioDetailsHTMLF) : ''}<p><strong>Precio costo:</strong> $${Math.round(totalCosto).toLocaleString()}</p><p><strong>Precio venta:</strong> $${Math.round(precioVenta).toLocaleString()}</p><p><strong>IVA (19%):</strong> $${Math.round(ivaF).toLocaleString()}</p><p><strong>Precio final:</strong> $${Math.round(precioFinal).toLocaleString()}</p></div><div class="desglose-materiales"><h5>Desglose de materiales</h5>${desgloseHTML}</div></div></div>`;
        }).join('');
      }
    });
  };
}



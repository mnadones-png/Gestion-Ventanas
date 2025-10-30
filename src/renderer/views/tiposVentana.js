import { showInAppAlert, showInAppConfirm } from '../modals.js';
import { materialesPorDimension } from '../materiales.js';

export async function showTiposVentana() {
  await ensureMateriales();
  const content = document.getElementById('content');
  content.innerHTML = `
    <h2>Nuevo Tipo de Ventana</h2>
    <form id="tipoVentanaForm" style="max-width:600px;">
      <label>Nombre del tipo de ventana</label>
      <input type="text" id="nombreVentana" required>
      <h3>Materiales</h3>
      <div id="materialesContainer"></div>
      <button type="button" class="button-primary" id="agregarMaterial">Agregar Material</button>
      <button class="button-primary" type="submit" style="margin-top:20px;">Guardar Tipo de Ventana</button>
    </form>
    <hr>
    <h3>Tipos de Ventana Guardados</h3>
    <table class="table" id="tablaTipos">
      <thead><tr><th>Nombre</th><th>Materiales</th><th>Acciones</th></tr></thead>
      <tbody></tbody>
    </table>
  `;

  let materiales = [];
  function renderMateriales() {
    const container = document.getElementById('materialesContainer');
    container.innerHTML = '';
    materiales.forEach((mat, idx) => {
      const div = document.createElement('div');
      div.style.border = '1px solid #b2bec3';
      div.style.padding = '10px';
      div.style.marginBottom = '8px';
      div.style.borderRadius = '4px';

      const labelNombre = document.createElement('label');
      labelNombre.textContent = 'Nombre del material';
      const nombreContainer = document.createElement('div');
      nombreContainer.style.marginBottom = '10px';
      const selectNombre = document.createElement('select');
      selectNombre.required = true;
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '-- Seleccione un material --';
      selectNombre.appendChild(defaultOption);
      const porAncho = materialesPorDimension.porAncho || [];
      const porAlto = materialesPorDimension.porAlto || [];
      const todosLosMateriales = [...new Set([...porAncho, ...porAlto])].sort();
      todosLosMateriales.forEach(material => {
        const option = document.createElement('option');
        option.value = material;
        option.textContent = material.charAt(0).toUpperCase() + material.slice(1);
        if (material === (mat.nombre || '').toLowerCase()) option.selected = true;
        selectNombre.appendChild(option);
      });
      const otroOption = document.createElement('option');
      otroOption.value = 'otro';
      otroOption.textContent = 'Otro (personalizado)';
      selectNombre.appendChild(otroOption);
      const inputNombrePersonalizado = document.createElement('input');
      inputNombrePersonalizado.type = 'text';
      inputNombrePersonalizado.style.display = 'none';
      inputNombrePersonalizado.placeholder = 'Ingrese el nombre del material';
      if (mat.nombre && !todosLosMateriales.includes(mat.nombre.toLowerCase())) {
        selectNombre.value = 'otro';
        inputNombrePersonalizado.style.display = 'block';
        inputNombrePersonalizado.value = mat.nombre;
        inputNombrePersonalizado.required = true;
      }
      selectNombre.addEventListener('change', e => {
        const selectedValue = e.target.value;
        if (selectedValue === 'otro') {
          inputNombrePersonalizado.style.display = 'block';
          inputNombrePersonalizado.required = true;
          inputNombrePersonalizado.focus();
          materiales[idx].nombre = inputNombrePersonalizado.value;
        } else {
          inputNombrePersonalizado.style.display = 'none';
          inputNombrePersonalizado.required = false;
          materiales[idx].nombre = selectedValue;
        }
      });
      inputNombrePersonalizado.addEventListener('input', e => {
        if (selectNombre.value === 'otro') {
          materiales[idx].nombre = e.target.value;
        }
      });
      nombreContainer.appendChild(selectNombre);
      nombreContainer.appendChild(inputNombrePersonalizado);

      const labelTipo = document.createElement('label');
      labelTipo.textContent = 'Tipo';
      const selectTipo = document.createElement('select');
      ['Aluminio', 'Quincalleria'].forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo === 'Quincalleria' ? 'Quincallería' : tipo;
        if (mat.tipo === tipo) option.selected = true;
        selectTipo.appendChild(option);
      });
      selectTipo.required = true;
      selectTipo.addEventListener('change', e => { materiales[idx].tipo = e.target.value; });

      const labelCantidad = document.createElement('label');
      labelCantidad.textContent = 'Cantidad de material';
      const inputCantidad = document.createElement('input');
      inputCantidad.type = 'number';
      inputCantidad.min = '0';
      inputCantidad.step = '0.01';
      inputCantidad.value = mat.cantidad;
      inputCantidad.required = true;
      inputCantidad.addEventListener('input', e => { materiales[idx].cantidad = parseFloat(e.target.value); });

      const labelPrecio = document.createElement('label');
      labelPrecio.textContent = 'Precio/Costo por unidad';
      const inputPrecio = document.createElement('input');
      inputPrecio.type = 'number';
      inputPrecio.min = '0';
      inputPrecio.step = '0.01';
      inputPrecio.value = mat.precio;
      inputPrecio.required = true;
      inputPrecio.addEventListener('input', e => { materiales[idx].precio = parseFloat(e.target.value); });

      const btnEliminar = document.createElement('button');
      btnEliminar.type = 'button';
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.onclick = () => { materiales.splice(idx, 1); renderMateriales(); };

      div.appendChild(labelNombre);
      div.appendChild(nombreContainer);
      div.appendChild(labelTipo);
      div.appendChild(selectTipo);
      div.appendChild(labelCantidad);
      div.appendChild(inputCantidad);
      div.appendChild(labelPrecio);
      div.appendChild(inputPrecio);
      div.appendChild(btnEliminar);
      container.appendChild(div);
    });
  }

  document.getElementById('agregarMaterial').onclick = () => { materiales.push({ nombre: '', tipo: 'Aluminio', cantidad: 1, precio: 0 }); renderMateriales(); };
  renderMateriales();

  document.getElementById('tipoVentanaForm').onsubmit = async function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombreVentana').value;
    if (!nombre || materiales.length === 0 || materiales.some(m => !m.nombre || !m.tipo || isNaN(m.cantidad) || isNaN(m.precio))) {
      await showInAppAlert('Aviso', 'Completa todos los campos y agrega al menos un material.');
      return;
    }
    await window.api.addTipoVentana({ nombre, materiales });
    materiales = [];
    renderMateriales();
    await cargarTablaTipos();
    document.getElementById('tipoVentanaForm').reset();
  };

  await cargarTablaTipos();
}

async function cargarTablaTipos() {
  const tipos = await window.api.getTiposVentana();
  const tbody = document.querySelector('#tablaTipos tbody');
  tbody.innerHTML = tipos.map((t) => `
    <tr>
      <td>${t.nombre}</td>
      <td>
        <ul>
          ${t.materiales.map(mat => `<li>${mat.nombre} (${mat.tipo}) - Cantidad: ${mat.cantidad}, Precio: $${mat.precio}</li>`).join('')}
        </ul>
      </td>
      <td>
        <button onclick="window.editarTipo(${t.id})">Editar</button>
        <button onclick="window.eliminarTipo(${t.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');

  window.editarTipo = async function(id) {
    const tipos = await window.api.getTiposVentana();
    const tipo = tipos.find(t => t.id === id);
    if (!tipo) return;
    const content = document.getElementById('content');
    content.innerHTML = `
      <h2>Editar Tipo de Ventana</h2>
      <form id="editTipoForm" style="max-width:600px;">
        <label>Nombre del tipo de ventana</label>
        <input type="text" id="editNombreVentana" value="${tipo.nombre}" required>
        <h3>Materiales</h3>
        <div id="editMaterialesContainer"></div>
        <button type="button" class="button-primary" id="agregarEditMaterial">Agregar Material</button>
        <button class="button-primary" type="submit" style="margin-top:20px;">Guardar Cambios</button>
      </form>
      <button class="button-primary" id="cancelEdit">Cancelar</button>
    `;
    let materiales = tipo.materiales.map(m => ({ ...m }));
    function renderEditMateriales() {
      const container = document.getElementById('editMaterialesContainer');
      container.innerHTML = '';
      materiales.forEach((mat, idx) => {
        const div = document.createElement('div');
        div.style.border = '1px solid #b2bec3';
        div.style.padding = '10px';
        div.style.marginBottom = '8px';
        div.style.borderRadius = '4px';
        const labelNombre = document.createElement('label');
        labelNombre.textContent = 'Nombre del material';
        const nombreContainer = document.createElement('div');
        nombreContainer.style.marginBottom = '10px';
        const selectNombre = document.createElement('select');
        selectNombre.required = true;
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Seleccione un material --';
        selectNombre.appendChild(defaultOption);
        const porAncho = materialesPorDimension.porAncho || [];
        const porAlto = materialesPorDimension.porAlto || [];
        const todosLosMateriales = [...new Set([...porAncho, ...porAlto])].sort();
        todosLosMateriales.forEach(material => {
          const option = document.createElement('option');
          option.value = material;
          option.textContent = material.charAt(0).toUpperCase() + material.slice(1);
          if (material === mat.nombre.toLowerCase()) option.selected = true;
          selectNombre.appendChild(option);
        });
        const otroOption = document.createElement('option');
        otroOption.value = 'otro';
        otroOption.textContent = 'Otro (personalizado)';
        selectNombre.appendChild(otroOption);
        const inputNombrePersonalizado = document.createElement('input');
        inputNombrePersonalizado.type = 'text';
        inputNombrePersonalizado.style.display = 'none';
        inputNombrePersonalizado.placeholder = 'Ingrese el nombre del material';
        if (mat.nombre && !todosLosMateriales.includes(mat.nombre.toLowerCase())) {
          selectNombre.value = 'otro';
          inputNombrePersonalizado.style.display = 'block';
          inputNombrePersonalizado.value = mat.nombre;
          inputNombrePersonalizado.required = true;
        }
        selectNombre.addEventListener('change', e => {
          const selectedValue = e.target.value;
          if (selectedValue === 'otro') {
            inputNombrePersonalizado.style.display = 'block';
            inputNombrePersonalizado.required = true;
            inputNombrePersonalizado.focus();
            materiales[idx].nombre = inputNombrePersonalizado.value;
          } else {
            inputNombrePersonalizado.style.display = 'none';
            inputNombrePersonalizado.required = false;
            materiales[idx].nombre = selectedValue;
          }
        });
        inputNombrePersonalizado.addEventListener('input', e => {
          if (selectNombre.value === 'otro') materiales[idx].nombre = e.target.value;
        });
        nombreContainer.appendChild(selectNombre);
        nombreContainer.appendChild(inputNombrePersonalizado);
        const labelTipo = document.createElement('label');
        labelTipo.textContent = 'Tipo';
        const selectTipo = document.createElement('select');
        ['Aluminio', 'Quincalleria'].forEach(tipo => {
          const option = document.createElement('option');
          option.value = tipo;
          option.textContent = tipo === 'Quincalleria' ? 'Quincallería' : tipo;
          if (mat.tipo === tipo) option.selected = true;
          selectTipo.appendChild(option);
        });
        selectTipo.required = true;
        selectTipo.addEventListener('change', e => { materiales[idx].tipo = e.target.value; });
        const labelCantidad = document.createElement('label');
        labelCantidad.textContent = 'Cantidad de material';
        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = '0';
        inputCantidad.step = '0.01';
        inputCantidad.value = mat.cantidad;
        inputCantidad.required = true;
        inputCantidad.addEventListener('input', e => { materiales[idx].cantidad = parseFloat(e.target.value); });
        const labelPrecio = document.createElement('label');
        labelPrecio.textContent = 'Precio/Costo por unidad';
        const inputPrecio = document.createElement('input');
        inputPrecio.type = 'number';
        inputPrecio.min = '0';
        inputPrecio.step = '0.01';
        inputPrecio.value = mat.precio;
        inputPrecio.required = true;
        inputPrecio.addEventListener('input', e => { materiales[idx].precio = parseFloat(e.target.value); });
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.onclick = () => { materiales.splice(idx, 1); renderEditMateriales(); };
        div.appendChild(labelNombre);
        div.appendChild(nombreContainer);
        div.appendChild(labelTipo);
        div.appendChild(selectTipo);
        div.appendChild(labelCantidad);
        div.appendChild(inputCantidad);
        div.appendChild(labelPrecio);
        div.appendChild(inputPrecio);
        div.appendChild(btnEliminar);
        container.appendChild(div);
      });
    }
    document.getElementById('agregarEditMaterial').onclick = () => { materiales.push({ nombre: '', tipo: 'Aluminio', cantidad: 1, precio: 0 }); renderEditMateriales(); };
    renderEditMateriales();
    document.getElementById('editTipoForm').onsubmit = async function(e) {
      e.preventDefault();
      const nombre = document.getElementById('editNombreVentana').value;
      if (!nombre || materiales.length === 0 || materiales.some(m => !m.nombre || !m.tipo || isNaN(m.cantidad) || isNaN(m.precio))) {
        await showInAppAlert('Aviso', 'Completa todos los campos y agrega al menos un material.');
        return;
      }
      const confirmar = await showInAppConfirm('Confirmar cambios', '¿Deseas guardar los cambios realizados en este tipo de ventana?');
      if (!confirmar) return;
      await window.api.editTipoVentana({ id, nombre, materiales });
      await showInAppAlert('Éxito', 'Cambios guardados correctamente.');
      showTiposVentana();
    };
    document.getElementById('cancelEdit').onclick = showTiposVentana;
  };

  window.eliminarTipo = async function(id) {
    const ok = await showInAppConfirm('Eliminar tipo de ventana', '¿Seguro que quieres eliminar este tipo de ventana? Esta acción no se puede deshacer.');
    if (!ok) return;
    await window.api.deleteTipoVentana(id);
    await cargarTablaTipos();
  };
}

async function ensureMateriales() {
  try { await cargarMaterialesDimension(); } catch (_) {}
}



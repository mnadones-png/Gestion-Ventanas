import { showInAppAlert, showInAppConfirm } from '../modals.js';
import { materialesPorDimension, cargarMaterialesDimension } from '../materiales.js';

export async function showMaterialesPorDimension() {
  const content = document.getElementById('content');
  await cargarMaterialesDimension();
  content.innerHTML = `
    <h2>Materiales por Dimensión</h2>
    <div class="materiales-container" style="display:flex;gap:20px;">
      <div class="materiales-column" style="flex:1;">
        <h3>Materiales por Ancho</h3>
        <div id="listaPorAncho" style="margin-bottom:20px;"></div>
        <div style="margin-bottom:20px;">
          <input type="text" id="nuevoMaterialAncho" placeholder="Nuevo material por ancho" style="margin-right:10px;">
          <button id="btnAgregarAncho" class="button-primary">Agregar</button>
        </div>
      </div>
      <div class="materiales-column" style="flex:1;">
        <h3>Materiales por Alto</h3>
        <div id="listaPorAlto" style="margin-bottom:20px;"></div>
        <div style="margin-bottom:20px;">
          <input type="text" id="nuevoMaterialAlto" placeholder="Nuevo material por alto" style="margin-right:10px;">
          <button id="btnAgregarAlto" class="button-primary">Agregar</button>
        </div>
      </div>
    </div>
  `;

  function renderList() {
    const ancho = document.getElementById('listaPorAncho');
    const alto = document.getElementById('listaPorAlto');
    ancho.innerHTML = (materialesPorDimension.porAncho || []).map((material, index) => `
      <div class="material-item" style="display:flex;gap:10px;margin-bottom:8px;">
        <input type="text" value="${material}" data-tipo="porAncho" data-index="${index}" class="material-input" style="flex:1;">
        <button data-action="del" data-tipo="porAncho" data-index="${index}" class="button-delete">Eliminar</button>
      </div>`).join('');
    alto.innerHTML = (materialesPorDimension.porAlto || []).map((material, index) => `
      <div class="material-item" style="display:flex;gap:10px;margin-bottom:8px;">
        <input type="text" value="${material}" data-tipo="porAlto" data-index="${index}" class="material-input" style="flex:1;">
        <button data-action="del" data-tipo="porAlto" data-index="${index}" class="button-delete">Eliminar</button>
      </div>`).join('');
    bindDynamicHandlers();
  }

  function bindDynamicHandlers() {
    document.querySelectorAll('.material-input').forEach(input => {
      input.addEventListener('change', function() {
        const tipo = this.dataset.tipo;
        const index = parseInt(this.dataset.index);
        materialesPorDimension[tipo][index] = this.value.toLowerCase();
      });
    });
    document.querySelectorAll('button[data-action="del"]').forEach(btn => {
      btn.onclick = async function() {
        const tipo = this.dataset.tipo; const index = parseInt(this.dataset.index);
        const ok = await showInAppConfirm('Eliminar material', '¿Estás seguro de eliminar este material?');
        if (!ok) return;
        materialesPorDimension[tipo].splice(index, 1);
        renderList();
      };
    });
  }

  document.getElementById('btnAgregarAncho').onclick = async function() {
    const input = document.getElementById('nuevoMaterialAncho');
    const nuevo = (input.value || '').trim().toLowerCase();
    if (!nuevo) { await showInAppAlert('Aviso', 'Ingresa un nombre de material válido.'); return; }
    materialesPorDimension.porAncho.push(nuevo); input.value = ''; renderList();
  };
  document.getElementById('btnAgregarAlto').onclick = async function() {
    const input = document.getElementById('nuevoMaterialAlto');
    const nuevo = (input.value || '').trim().toLowerCase();
    if (!nuevo) { await showInAppAlert('Aviso', 'Ingresa un nombre de material válido.'); return; }
    materialesPorDimension.porAlto.push(nuevo); input.value = ''; renderList();
  };

  renderList();
}



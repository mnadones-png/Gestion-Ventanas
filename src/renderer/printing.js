import { showInAppAlert } from './modals.js';

export async function imprimirPresupuestos(presupuestos, tipos, tiposVidrio) {
  try {
    const previewModal = document.createElement('div');
    previewModal.setAttribute('data-preview-modal', '');
    previewModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 80%;
      height: 80%;
      display: flex;
      flex-direction: column;
    `;

    const modalHeader = document.createElement('div');
    modalHeader.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    `;

    const modalTitle = document.createElement('h3');
    modalTitle.textContent = 'Vista Previa de Impresión';
    modalTitle.style.margin = '0';

    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 10px;
    `;

    const printButton = document.createElement('button');
    printButton.textContent = 'Imprimir';
    printButton.className = 'button-primary';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancelar';
    cancelButton.className = 'button-secondary';

    buttonsContainer.appendChild(printButton);
    buttonsContainer.appendChild(cancelButton);

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(buttonsContainer);

    const previewFrame = document.createElement('iframe');
    previewFrame.style.cssText = `
      flex: 1;
      width: 100%;
      border: 1px solid #ccc;
      border-radius: 4px;
    `;

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(previewFrame);
    previewModal.appendChild(modalContent);
    document.body.appendChild(previewModal);

    let sumaFinalSeleccion = 0;
    let sumaCostoSeleccion = 0;
    let sumaVentaSeleccion = 0;
    for (const p of presupuestos) {
      const precioVentaLocal = Math.round(p.total * 2);
      const persistedPrecioFinalLocal = typeof p.precio_final !== 'undefined' && p.precio_final !== null ? Number(p.precio_final) : null;
      const persistedAplicaIvaLocal = typeof p.aplica_iva !== 'undefined' && p.aplica_iva !== null ? Boolean(p.aplica_iva) : null;
      const ivaLocal = persistedAplicaIvaLocal === null ? (precioVentaLocal * 0.19) : (persistedAplicaIvaLocal ? (precioVentaLocal * 0.19) : 0);
      const precioFinalLocal = persistedPrecioFinalLocal !== null ? persistedPrecioFinalLocal : (precioVentaLocal + ivaLocal);
      sumaFinalSeleccion += Math.round(precioFinalLocal);
      sumaCostoSeleccion += Math.round(p.total);
      sumaVentaSeleccion += Math.round(precioVentaLocal);
    }

    let printContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Presupuestos - FabGlass</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; line-height: 1.4; }
          .presupuesto { page-break-inside: avoid; margin-bottom: 30px; border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { margin: 0; color: #2d3436; font-size: 24px; }
          .header p { margin: 5px 0; color: #636e72; }
          .resumen-seleccion { background: #f1f2f6; padding: 12px 14px; border-radius: 6px; margin: 10px 0 20px 0; border: 1px solid #dfe4ea; }
          .info-cliente { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
          .info-cliente h3 { margin: 0 0 10px 0; color: #2d3436; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; }
          .info-cliente p { margin: 5px 0; }
          .detalles-presupuesto { margin-bottom: 20px; }
          .detalles-presupuesto h4 { margin: 0 0 10px 0; color: #2d3436; }
          .detalles-presupuesto p { margin: 5px 0; }
          .resumen-precios { background: #e9ecef; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
          .resumen-precios h4 { margin: 0 0 10px 0; color: #2d3436; }
          .precio-item { display: flex; justify-content: space-between; margin: 5px 0; }
          .precio-final { font-weight: bold; font-size: 16px; color: #2d3436; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 10px; color: #636e72; }
          @media print { body { margin: 0; } .presupuesto { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FabGlass</h1>
          <p>Presupuestos de Ventanas</p>
          <p>Fecha de impresión: ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
        ${presupuestos.length > 1 ? `
          <div class="resumen-seleccion">
            <strong>Resumen de la selección</strong>
            <div class="precio-item"><span>Ítems seleccionados:</span><span>${presupuestos.length}</span></div>
            <div class="precio-item precio-final"><span>Suma precio final:</span><span>$${sumaFinalSeleccion.toLocaleString()}</span></div>
          </div>
        ` : ''}
    `;

    for (const p of presupuestos) {
      const tipo = tipos.find(t => t.id === p.tipo_ventana_id);
      const precioVenta = Math.round(p.total * 2);
      const persistedPrecioFinal = typeof p.precio_final !== 'undefined' && p.precio_final !== null ? Number(p.precio_final) : null;
      const persistedAplicaIva = typeof p.aplica_iva !== 'undefined' && p.aplica_iva !== null ? Boolean(p.aplica_iva) : null;
      const iva = persistedAplicaIva === null ? (precioVenta * 0.19) : (persistedAplicaIva ? (precioVenta * 0.19) : 0);
      const precioFinal = persistedPrecioFinal !== null ? persistedPrecioFinal : (precioVenta + iva);

      let vidrioInfo = '';
      const vidIdx = typeof p.tipo_vidrio_idx !== 'undefined' && p.tipo_vidrio_idx !== null ? p.tipo_vidrio_idx : '';
      if (vidIdx !== '' && tiposVidrio[vidIdx]) {
        const v = tiposVidrio[vidIdx];
        vidrioInfo = `<p><strong>Vidrio:</strong> ${v.nombre}</p>`;
      }

      printContent += `
        <div class="presupuesto">
          <div class="info-cliente">
            <h3>Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${p.cliente_nombre}</p>
            <p><strong>RUT:</strong> ${p.cliente_rut}</p>
            ${p.cliente_telefono ? `<p><strong>Teléfono:</strong> ${p.cliente_telefono}</p>` : ''}
            ${p.cliente_correo ? `<p><strong>Correo:</strong> ${p.cliente_correo}</p>` : ''}
          </div>
          <div class="detalles-presupuesto">
            <h4>Detalles del Presupuesto</h4>
            <p><strong>Fecha:</strong> ${p.fecha}</p>
            <p><strong>Tipo de ventana:</strong> ${tipo ? tipo.nombre : 'No especificado'}</p>
            <p><strong>Medidas:</strong> ${p.ancho} x ${p.alto} metros (Área: ${(p.ancho * p.alto).toFixed(3)} m²)</p>
            ${vidrioInfo}
            ${p.descripcion ? `<p><strong>Descripción:</strong> ${p.descripcion}</p>` : ''}
          </div>
          <div class="resumen-precios">
            <h4>Precio Final</h4>
            <div class="precio-item precio-final"><span>Precio final:</span><span>$${Math.round(precioFinal).toLocaleString()}</span></div>
          </div>
          <div class="footer">
            <p>Presupuesto generado por FabGlass - ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      `;
    }

    printContent += `</body></html>`;

    previewFrame.contentDocument.write(printContent);
    previewFrame.contentDocument.close();

    printButton.onclick = async function() {
      try {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
          throw new Error('No se pudo crear la ventana de impresión. Por favor, asegúrese de que las ventanas emergentes estén permitidas.');
        }
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = function() {
          try { printWindow.print(); } catch (printError) {
            console.error('Error al imprimir:', printError);
            showInAppAlert('Error', 'Error al imprimir: ' + printError.message);
          } finally { printWindow.close(); }
        };
        previewModal.remove();
        await showInAppAlert('Éxito', `Se generaron ${presupuestos.length} presupuesto(s) para imprimir.`);
      } catch (error) {
        console.error('Error al generar la impresión:', error);
        await showInAppAlert('Error', 'Error al generar la impresión: ' + error.message);
      }
    };

    cancelButton.onclick = function() { previewModal.remove(); };
  } catch (error) {
    console.error('Error al generar presupuestos:', error);
    await showInAppAlert('Error', 'Error al generar los presupuestos: ' + error.message);
    const existingPreview = document.querySelector('[data-preview-modal]');
    if (existingPreview) { existingPreview.remove(); }
  }
}



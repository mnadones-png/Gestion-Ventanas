export function showInAppConfirm(title, message) {
  return new Promise((resolve) => {
    const modalHTML = `
      <div id="modalConfirmInApp" style="display:flex;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;">
        <div style="background:#fff;padding:22px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.12);text-align:left;max-width:520px;">
          <h3 style="margin:0 0 8px 0;color:#333;font-size:1.1rem;">${title}</h3>
          <p style="margin:0 0 16px 0;color:#555;">${message}</p>
          <div style="display:flex;justify-content:flex-end;gap:8px;">
            <button id="btnConfirmCancel" class="button-primary" style="background:#636e72;">Cancelar</button>
            <button id="btnConfirmOk" class="button-primary">Aceptar</button>
          </div>
        </div>
      </div>
    `;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHTML;
    document.body.appendChild(wrapper.firstElementChild);
    const btnOk = document.getElementById('btnConfirmOk');
    const btnCancel = document.getElementById('btnConfirmCancel');
    function cleanup(result) {
      const modal = document.getElementById('modalConfirmInApp');
      if (modal) modal.remove();
      resolve(result);
    }
    setTimeout(() => { if (btnOk) btnOk.focus(); }, 50);
    btnOk.onclick = () => cleanup(true);
    btnCancel.onclick = () => cleanup(false);
    function onKey(e) {
      if (e.key === 'Escape') {
        cleanup(false);
        document.removeEventListener('keydown', onKey);
      }
    }
    document.addEventListener('keydown', onKey);
  });
}

export function showInAppAlert(title, message) {
  return new Promise((resolve) => {
    const modalHTML = `
      <div id="modalAlertInApp" style="display:flex;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;">
        <div style="background:#fff;padding:22px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.12);text-align:left;max-width:520px;">
          <h3 style="margin:0 0 8px 0;color:#333;font-size:1.1rem;">${title}</h3>
          <p style="margin:0 0 16px 0;color:#555;">${message}</p>
          <div style="display:flex;justify-content:flex-end;gap:8px;">
            <button id="btnAlertOk" class="button-primary">Aceptar</button>
          </div>
        </div>
      </div>
    `;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHTML;
    document.body.appendChild(wrapper.firstElementChild);
    const btnOk = document.getElementById('btnAlertOk');
    function cleanup() {
      const modal = document.getElementById('modalAlertInApp');
      if (modal) modal.remove();
      resolve();
    }
    setTimeout(() => { if (btnOk) btnOk.focus(); }, 50);
    btnOk.onclick = cleanup;
    function onKey(e) {
      if (e.key === 'Escape') {
        cleanup();
        document.removeEventListener('keydown', onKey);
      }
    }
    document.addEventListener('keydown', onKey);
  });
}

// Exponer en window para reutilización externa cuando sea necesario
if (typeof window !== 'undefined') {
  window.showInAppAlert = showInAppAlert;
  window.showInAppConfirm = showInAppConfirm;
}



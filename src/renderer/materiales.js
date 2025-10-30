export let materialesPorDimension = {
  porAncho: [],
  porAlto: []
};

export async function cargarMaterialesDimension() {
  try {
    const materiales = await window.api.getMaterialesDimension();
    if (!materiales || !materiales.porAncho || !materiales.porAlto) {
      throw new Error('Formato de materiales inválido');
    }
    materialesPorDimension = materiales;
    console.log('Materiales cargados:', materialesPorDimension);
    return true;
  } catch (error) {
    console.error('Error al cargar materiales:', error);
    if (window.showInAppAlert) {
      await window.showInAppAlert('Error', 'No se pudieron cargar los materiales. Por favor, reinicie la aplicación.');
    }
    return false;
  }
}

// Carga inicial automática
(async () => { try { await cargarMaterialesDimension(); } catch (_) {} })();



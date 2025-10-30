export const state = {
  currentView: 'welcome',
  fechaActual: new Date(),
  gastosMesActivo: false,
  mesCerrado: false,
  selectedMonth: null,
  selectedYear: null
};

export function setState(partial) {
  Object.assign(state, partial);
}



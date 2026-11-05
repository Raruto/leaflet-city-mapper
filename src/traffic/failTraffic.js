export function failTraffic(state, error) {
  state.error = error;
  state.status.textContent = `${state.vehicle}: Error: ${error.message}`;
  state.status.setAttribute('role', 'alert');
  console.error('Traffic layer', error);
}

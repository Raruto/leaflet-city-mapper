export function failTraffic(state, error) {
  state.error = error;
  state.status.textContent = `Error: ${error.message}`;
  state.status.setAttribute('role', 'alert');
  console.error('Traffic layer', error);
}

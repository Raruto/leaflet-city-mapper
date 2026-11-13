/**
 * Record and log a traffic error and expose it in the layer status.
 *
 * @param {Object} state Traffic layer state.
 * @param {Error} error Error to report.
 */
export function failTraffic(state, error) {
  state.error = error;
  state.status.textContent = `${state.vehicle}: Error: ${error.message}`;
  state.status.setAttribute('role', 'alert');
  console.error('Traffic layer', error);
}

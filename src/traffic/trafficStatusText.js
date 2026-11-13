/**
 * Format the traffic layer status for an invalid clock, loading state or active trip count.
 *
 * @param {Object} state Traffic layer state.
 * @param {boolean} valid Whether the simulation time is valid.
 *
 * @returns {string} Status text.
 */
export function trafficStatusText(state, valid) {
  if (!valid) return `${state.vehicle}: select a valid simulation date`;
  if (!state.loaded) return `${state.vehicle}: loading…`;
  return `${state.trips.length} ${state.vehicle === 'boat' ? 'boats' : state.vehicle}`;
}

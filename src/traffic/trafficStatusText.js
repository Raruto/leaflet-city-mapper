export function trafficStatusText(state, valid) {
  if (!valid) return `${state.vehicle}: select a valid simulation date`;
  if (!state.loaded) return `${state.vehicle}: loading…`;
  return `${state.trips.length} ${state.vehicle === 'boat' ? 'boats' : state.vehicle}`;
}

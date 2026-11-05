export function current(state) {
  return state.source._nativeGPU === state && state.map.hasLayer(state.source);
}

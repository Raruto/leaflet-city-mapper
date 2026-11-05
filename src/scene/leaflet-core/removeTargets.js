export function removeTargets(state) {
  if (state.source._nativeGPU === state) state.source._nativeGPU = null;
  state.dispose?.();
  for (const element of state.hidden) {
    element.classList.remove('leaflet-webgpu-target');
  }
}

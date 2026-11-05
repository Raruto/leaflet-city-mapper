export function hideTargets(state) {
  const { source } = state;
  const htmlIcon = source instanceof L.Marker && source.options.icon instanceof L.DivIcon;
  const targets = [htmlIcon ? null : source._icon, htmlIcon ? null : source._shadow];
  let element;
  for (element of state.hidden) {
    if (targets.includes(element)) continue;
    element.classList.remove('leaflet-webgpu-target');
    state.hidden.delete(element);
  }
  for (element of targets) {
    if (!element || state.hidden.has(element)) continue;
    element.classList.add('leaflet-webgpu-target');
    state.hidden.add(element);
  }
}

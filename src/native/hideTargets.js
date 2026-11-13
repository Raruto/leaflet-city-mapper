import { L } from '../globals/L.js';

/**
 * Hide rendered marker images while leaving HTML icons available for interaction.
 *
 * @param {Object} state Native layer state and its set of hidden elements.
 */
export function hideTargets(state) {
  const { source } = state;
  const htmlIcon = source instanceof L.Marker && source.options.icon instanceof L.DivIcon;
  const icon = htmlIcon ? null : source._icon, shadow = htmlIcon ? null : source._shadow;
  let i, element;
  for (element of state.hidden) {
    if (element === icon || element === shadow) continue;
    element.classList.remove('leaflet-webgpu-target');
    state.hidden.delete(element);
  }
  for (i = 0; i < 2; i++) {
    element = i ? shadow : icon;
    if (!element || state.hidden.has(element)) continue;
    element.classList.add('leaflet-webgpu-target');
    state.hidden.add(element);
  }
}

import { installSunlight } from './installSunlight.js';
import { underEntry } from './underEntry.js';

export function onAddSun(layer, map) {
  layer.control = layer.control || installSunlight(map);
  if (!layer.control._map) {
    layer.control.addTo(map);
  }
  // Shown under this layer's entry in the layers control; a standalone control without one.
  const container = layer.control.getContainer(), nested = underEntry(layer, container);
  container.classList.toggle('leaflet-control', !nested);
  container.classList.toggle('leaflet-bar', !nested);
  Object.assign(
    container.style,
    nested
      ? { background: '', padding: '2px 0 6px 20px', margin: '0' }
      : { background: '#fff', padding: '8px', margin: '' }
  );
}

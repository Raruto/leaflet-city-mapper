import { underEntry } from '../utils/underEntry.js';
import { installSunlight } from '../utils/installSunlight.js';

// Sun/moon clock control and sky colours; the control is created on first add (`layer.control`).
L.Layer.types.sunlight = L.Layer.extend({
  onAdd(map) {
    this.control = this.control || installSunlight(map);
    if (!this.control._map) this.control.addTo(map);
    // Shown under this layer's entry in the layers control; a standalone control without one.
    const container = this.control.getContainer(), nested = underEntry(this, container);
    container.classList.toggle('leaflet-control', !nested);
    container.classList.toggle('leaflet-bar', !nested);
    Object.assign(container.style, nested
      ? { background: '', padding: '2px 0 6px 20px', margin: '0' }
      : { background: '#fff', padding: '8px', margin: '' });
  },
  onRemove() {
    this.control.remove();
  },
});

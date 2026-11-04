import { onAddSun } from './onAddSun.js';
import { underEntry } from '../scene/underEntry.js';

L.Control.Time = L.Control.extend({
  options: { position: 'bottomright' },

  initialize(options) {
    L.Util.setOptions(this, options);
    this.live = true;
    this.layer = new L.Layer();
    this.layer.control = this;
    this.layer.onAdd = map => this.addTo(map);
    this.layer.onRemove = () => L.Control.prototype.remove.call(this);
  },

  onAdd(map) {
    return onAddSun(this, map);
  },

  addTo(map) {
    L.Control.prototype.addTo.call(this, map);
    const container = this.getContainer();
    const style = nested => {
      container.classList.toggle('leaflet-control', !nested);
      container.classList.toggle('leaflet-bar', !nested);
      Object.assign(container.style, nested
        ? { background: '', padding: '2px 0 6px 20px', margin: '0' }
        : { background: '#fff', padding: '8px', margin: '' });
    };
    if (this.layer._map === map) underEntry(this.layer, container, style);
    else style(false);
    return this;
  },

  remove() {
    if (this._map?.hasLayer(this.layer)) {
      this._map.removeLayer(this.layer);
      return this;
    }
    return L.Control.prototype.remove.call(this);
  },
});
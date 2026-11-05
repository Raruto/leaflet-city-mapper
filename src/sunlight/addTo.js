import { underEntry } from '../scene/underEntry.js';
import { styleTimeControl } from './styleTimeControl.js';

export function addTo(map) {
  L.Control.prototype.addTo.call(this, map);
  const container = this.getContainer();
  if (this.layer._map === map) underEntry(this.layer, container, styleTimeControl.bind(null, container));
  else styleTimeControl(container, false);
  return this;
}

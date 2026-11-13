import { L } from '../globals/L.js';
import { underEntry } from '../layer-controls/underEntry.js';
import { styleTimeControl } from './styleTimeControl.js';

/**
 * Add the time control to a map and place it under its layer entry when available.
 *
 * @param {L.Map} map Map receiving the control.
 *
 * @returns {L.Control} The time control.
 */
export function addTo(map) {
  L.Control.prototype.addTo.call(this, map);
  const container = this.getContainer();
  if (this.layer._map === map) underEntry(this.layer, container, styleTimeControl.bind(null, container));
  else styleTimeControl(container, false);
  return this;
}

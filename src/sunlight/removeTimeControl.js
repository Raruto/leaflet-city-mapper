import { L } from '../globals/L.js';

/**
 * Remove the time layer if attached, otherwise remove this control directly.
 *
 * @returns {L.Control} The time control.
 */
export function remove() {
  if (this._map?.hasLayer(this.layer)) {
    this._map.removeLayer(this.layer);
    return this;
  }
  return L.Control.prototype.remove.call(this);
}

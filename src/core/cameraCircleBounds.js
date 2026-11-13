import { boundsMethods } from '../weakmaps/boundsMethods.js';
import { projectNativePath } from './projectNativePath.js';

/**
 * Project this circle when mapped and return its original Leaflet bounds.
 *
 * @returns {L.LatLngBounds} Circle bounds.
 */
export function cameraCircleBounds() {
  if (this._map) projectNativePath(this);
  return boundsMethods.get(this).call(this);
}

import { closestMethods } from '../weakmaps/closestMethods.js';
import { projectNativePath } from './projectNativePath.js';

/**
 * Project this path and find its closest layer point using Leaflet's original method.
 *
 * @param {L.Point} point Layer point to compare.
 *
 * @returns {L.Point} Closest point on the path.
 */
export function closestCameraLayerPoint(point) {
  projectNativePath(this);
  this._parts = this._rings;
  return closestMethods.get(this).call(this, point);
}

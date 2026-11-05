import { closestMethods } from '../globals/closestMethods.js';


export function closestCameraLayerPoint(point) {
  this._project();
  this._parts = this._rings;
  return closestMethods.get(this).call(this, point);
}

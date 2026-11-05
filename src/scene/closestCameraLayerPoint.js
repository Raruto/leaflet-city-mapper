import { indexState } from './constants/indexState.js';

export function closestCameraLayerPoint(point) {
  this._project();
  this._parts = this._rings;
  return indexState.closestMethods.get(this).call(this, point);
}

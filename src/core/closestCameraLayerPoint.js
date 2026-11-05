import { state as sharedState } from '../state.js';

export function closestCameraLayerPoint(point) {
  this._project();
  this._parts = this._rings;
  return sharedState.closestMethods.get(this).call(this, point);
}

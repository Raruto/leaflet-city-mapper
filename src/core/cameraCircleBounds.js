import { state as sharedState } from '../state.js';

export function cameraCircleBounds() {
  this._project();
  return sharedState.boundsMethods.get(this).call(this);
}

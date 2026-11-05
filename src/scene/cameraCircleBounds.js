import { indexState } from './constants/indexState.js';

export function cameraCircleBounds() {
  this._project();
  return indexState.boundsMethods.get(this).call(this);
}

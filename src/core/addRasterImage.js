import { state as sharedState } from '../state.js';

import { fireRasterLoad } from './fireRasterLoad.js';

export function addRasterImage() {
  if (!this._image) this._initImage();
  if (this._image.complete && this._image.naturalWidth) {
    sharedState.pendingRasterLoads.push(this);
    queueMicrotask(fireRasterLoad);
  }
}

import { pendingRasterLoads } from '../globals/pendingRasterLoads.js';
import { fireRasterLoad } from '../core/fireRasterLoad.js';

/** Initialize this raster layer's image and queue its load event if already loaded. */
export function addRasterImage() {
  if (!this._image) this._initImage();
  if (this._image.complete && this._image.naturalWidth) {
    pendingRasterLoads.push(this);
    queueMicrotask(fireRasterLoad);
  }
}

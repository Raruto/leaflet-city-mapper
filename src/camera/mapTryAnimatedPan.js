import { state as sharedState } from '../state.js';

export function mapTryAnimatedPan(center, options) {
  // Leaflet's geographic recentering already supplies ground pixels, not screen pixels.
  const offset = this._getCenterOffset(center)._trunc();
  if (options?.animate !== true && !this.getSize().contains(offset)) return false;
  sharedState.mapMethods.panBy.call(this, offset, options);
  return true;
}

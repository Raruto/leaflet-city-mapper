import { state as sharedState } from '../state.js';

export function fireRasterLoad() {
  sharedState.pendingRasterLoads.shift()?.fire('load');
}

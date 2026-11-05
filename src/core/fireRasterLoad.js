import { indexState } from '../constants/indexState.js';

export function fireRasterLoad() {
  indexState.pendingRasterLoads.shift()?.fire('load');
}

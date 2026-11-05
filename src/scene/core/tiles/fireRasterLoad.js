import { indexState } from '../../layers/constants/indexState.js';

export function fireRasterLoad() {
  indexState.pendingRasterLoads.shift()?.fire('load');
}

import { pendingRasterLoads } from '../globals/pendingRasterLoads.js';

/** Fire the load event for the next queued raster image layer, if present. */
export function fireRasterLoad() {
  pendingRasterLoads.shift()?.fire('load');
}

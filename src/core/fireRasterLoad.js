import { pendingRasterLoads } from '../globals/pendingRasterLoads.js';


export function fireRasterLoad() {
  pendingRasterLoads.shift()?.fire('load');
}

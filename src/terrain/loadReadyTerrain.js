import { loadTerrain } from './loadTerrain.js';

/** Load the terrain backend after it is ready and settle the associated promise. */
export function loadReadyTerrain() {
  loadTerrain(this.backend).then(this.resolve, this.reject);
}

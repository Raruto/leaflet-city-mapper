import { loadTerrain } from './loadTerrain.js';

export function loadReadyTerrain() {
  loadTerrain(this.backend).then(this.resolve, this.reject);
}

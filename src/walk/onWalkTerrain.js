import { place } from './placeWalker.js';

export function onTerrain() {
  if (this.meshes) place.call(this);
}

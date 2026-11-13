import { place } from './placeWalker.js';

/** Reposition existing walker meshes after terrain elevation changes. */
export function onTerrain() {
  if (this.meshes) place.call(this);
}

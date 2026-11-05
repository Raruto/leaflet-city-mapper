import { place } from './place.js';

export function onTerrain() {
  if (this.meshes) place.call(this);
}

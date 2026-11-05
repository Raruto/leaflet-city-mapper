
import { compareMeshes } from './compareMeshes.js';

export function sortMeshes(meshes) {
  return meshes.sort(compareMeshes);
}

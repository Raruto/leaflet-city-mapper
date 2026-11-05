import { lightGrid } from './lightGrid.js';
import { worldLights } from './worldLights.js';

/** Keep fixed lamps cached when moving headlights change. */
export function cacheLightGrid(meshes, previous, maxBytes) {
  let unchanged = previous?.meshes.length === meshes.length;
  const packed = [], snapshots = [];
  for (let i = 0; i < meshes.length; i++) {
    const mesh = meshes[i], matrix = mesh.worldMatrix, lights = mesh.extras.lights;
    let cache = mesh._worldLights;
    let sameMatrix = Boolean(cache);
    for (let j = 0; j < matrix.length && sameMatrix; j++) sameMatrix = matrix[j] === cache.matrix[j];
    if (!sameMatrix || cache.lights !== lights) {
      cache = mesh._worldLights = { lights, matrix: [...matrix], data: worldLights(lights, matrix) };
    }
    unchanged &&= previous.meshes[i].mesh === mesh && previous.meshes[i].cache === cache;
    packed.push(cache.data);
    snapshots.push({ mesh, cache });
  }
  if (unchanged) return previous;
  return { ...lightGrid(packed, maxBytes), meshes: snapshots };
}

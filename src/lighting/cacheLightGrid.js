import { lightGrid } from './lightGrid.js';
import { worldLights } from './worldLights.js';

/** Keep fixed lamps cached when moving headlights change. */
export function cacheLightGrid(meshes, previous, maxBytes) {
  let unchanged = previous?.meshes.length === meshes.length;
  let i, mesh, matrix, lights, cache, sameMatrix, j;
  for (i = 0; i < meshes.length; i++) {
    mesh = meshes[i], matrix = mesh.worldMatrix, lights = mesh.extras.lights;
    cache = mesh._worldLights;
    sameMatrix = Boolean(cache);
    for (j = 0; j < matrix.length && sameMatrix; j++) sameMatrix = matrix[j] === cache.matrix[j];
    if (!sameMatrix || cache.lights !== lights) {
      cache = mesh._worldLights = /* alloc */ {
        lights,
        matrix: /* alloc */ [...matrix],
        data: worldLights(lights, matrix),
      };
    }
    unchanged &&= previous.meshes[i].mesh === mesh && previous.meshes[i].cache === cache;
  }
  if (unchanged) return previous;
  const packed = /* alloc */ new Array(meshes.length);
  const snapshots = /* alloc */ new Array(meshes.length);
  for (i = 0; i < meshes.length; i++) {
    mesh = meshes[i];
    cache = mesh._worldLights;
    packed[i] = cache.data;
    snapshots[i] = /* alloc */ { mesh, cache };
  }
  return /* alloc */ { ...lightGrid(packed, maxBytes), meshes: snapshots };
}

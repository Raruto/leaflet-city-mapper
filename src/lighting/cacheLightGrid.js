import { lightGrid } from './lightGrid.js';
import { worldLights } from './worldLights.js';

/**
 * Reuse a light grid when its meshes and world-space light snapshots are unchanged.
 *
 * @param {Object[]} meshes Meshes containing point lights.
 * @param {Object} [previous] Previous grid and mesh snapshots, if any.
 * @param {number} maxBytes Maximum GPU storage size in bytes.
 *
 * @returns {Object} Reused or rebuilt light grid and snapshots.
 */
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

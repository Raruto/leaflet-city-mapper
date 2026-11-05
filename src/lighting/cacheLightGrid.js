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
      cache = mesh._worldLights = /* allocation: required -- Each mesh retains its world-light transform snapshot independently of other grids. */ {
        lights,
        matrix: /* allocation: required -- Cache validation needs a matrix snapshot unaffected by later mesh movement. */ [...matrix],
        data: worldLights(lights, matrix),
      };
    }
    unchanged &&= previous.meshes[i].mesh === mesh && previous.meshes[i].cache === cache;
  }
  if (unchanged) return previous;
  const packed = /* allocation: required -- Packing inputs stay private while light accessors may reenter grid construction. */ [];
  const snapshots = /* allocation: required -- Each retained grid owns its mesh-cache membership snapshot. */ [];
  for (mesh of meshes) {
    cache = mesh._worldLights;
    packed.push(cache.data);
    snapshots.push(/* allocation: required -- The grid retains each mesh and the exact cache version used for its data. */ { mesh, cache });
  }
  return /* allocation: required -- The renderer retains this independently versioned light grid. */ { ...lightGrid(packed, maxBytes), meshes: snapshots };
}

import { layersByLayer } from '../weakmaps/layersByLayer.js';
import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { sceneByLayer } from '../weakmaps/sceneByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { traverse } from '../scene/traverse.js';
import { updateWorldMatrix } from '../transforms/updateWorldMatrix.js';
import { hitMesh } from './hitMesh.js';
import { trafficCollision } from '../collision/trafficCollision.js';

/**
 * Find the nearest wall faced by knee and chest rays along a horizontal walking direction.
 *
 * @param {L.Layer} layer Walking layer whose shared scene is tested.
 * @param {number} x World-space feet x coordinate.
 * @param {number} y World-space feet height.
 * @param {number} z World-space feet z coordinate.
 * @param {number} dx Horizontal unit direction along x.
 * @param {number} dz Horizontal unit direction along z.
 * @param {number} reach Maximum ray distance in metres.
 * @param {Object} data Reusable collision scratch and nearest-hit state.
 *
 * @returns {number[]|null} Nearest horizontal wall normal, or null when clear.
 */
export function hit(layer, x, y, z, dx, dz, reach, data) {
  updateWorldMatrix(sceneByLayer.get(layer));
  data.x = x, data.y = y, data.z = z, data.dx = dx, data.dz = dz, data.reach = reach;
  data.best = reach, data.found = false;
  let other;
  for (other of layersByLayer.get(sharedByLayer.get(layer))) {
    if (other === layer || kindByLayer.get(other) === 'terrain') continue;
    if (kindByLayer.get(other) === 'traffic') {
      trafficCollision(other, x, y, z, dx, dz, reach, data);
      continue;
    }
    traverse(rootByLayer.get(other), hitMesh, data);
  }
  return data.found ? data.normal : null;
}

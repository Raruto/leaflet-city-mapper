import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { layersByLayer } from '../weakmaps/layersByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { sceneByLayer } from '../weakmaps/sceneByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { updateWorldMatrix } from '../transforms/updateWorldMatrix.js';
import { insideMesh } from './insideMesh.js';
import { trafficCollision } from './trafficCollision.js';
import { local } from '../projections/walkerLocalPosition.js';

/**
 * Check the walker's body heights against scene geometry and current traffic bounds, excluding terrain.
 *
 * @param {Object} context Walk control state and reusable collision scratch.
 *
 * @returns {boolean} Whether the walker overlaps traffic or is enclosed by a mesh.
 */
export function insideWalker(context) {
  const { layer, local: localBuffer, hitData } = context;
  const shared = sharedByLayer.get(layer);
  if (!shared || !layersByLayer.get(shared)) return false;
  updateWorldMatrix(sceneByLayer.get(layer));
  const root = rootByLayer.get(layer);
  const feet = local.call(context, localBuffer);
  const x = root.position[0] + feet[0] * root.scale[0];
  const y = root.position[1] + feet[1] * root.scale[1];
  const z = root.position[2] + feet[2] * root.scale[2];
  const layers = layersByLayer.get(shared);
  let other, node, child, nodes;
  for (other of layers) {
    if (other === layer || kindByLayer.get(other) === 'terrain') continue;
    if (kindByLayer.get(other) === 'traffic') {
      hitData.best = 0;
      hitData.found = false;
      if (trafficCollision(other, x, y, z, 0, 0, 0, hitData)) return true;
      continue;
    }
    nodes = hitData.nodes;
    nodes.length = 0;
    if (rootByLayer.get(other)) nodes.push(rootByLayer.get(other));
    while (nodes.length) {
      node = nodes.pop();
      if (!node.visible) continue;
      if (node.geometry && (
        insideMesh(node, x, y + 0.45 * root.scale[1], z, hitData.seen, hitData.intersections) ||
        insideMesh(node, x, y + 1.35 * root.scale[1], z, hitData.seen, hitData.intersections)
      )) return true;
      for (child of node.children) nodes.push(child);
    }
  }
  return false;
}

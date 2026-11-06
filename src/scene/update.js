import { frameByLayer } from '../weakmaps/frameByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { pendingUpdates } from '../globals/pendingUpdates.js';


import { render } from "../rendering/render.js";

import { renderPendingUpdates } from './renderPendingUpdates.js';

/** Scene graph, shared camera and frame rendering. */
/** Content changes: render once on the next animation frame. */
export function update(layer) {
  const shared = sharedByLayer.get(layer);
  if (!shared) return layer;
  if (shared !== layer) {
    update(shared);
    return layer;
  }
  if (frameByLayer.get(layer) != null) return layer;
  const first = pendingUpdates.values().next().value;
  pendingUpdates.add(layer);
  mutateWeakMap(frameByLayer, layer, "=", first ? frameByLayer.get(first) : requestAnimationFrame(renderPendingUpdates));
  return layer;
}

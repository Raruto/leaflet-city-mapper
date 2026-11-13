import { frameByLayer } from '../weakmaps/frameByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { pendingUpdates } from '../globals/pendingUpdates.js';
import { render } from "../rendering/render.js";
import { renderPendingUpdates } from './renderPendingUpdates.js';

/**
 * Schedule one shared-scene render on the next animation frame.
 *
 * @param {L.Layer} layer Layer whose content changed.
 *
 * @returns {L.Layer} The supplied layer.
 */
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
  frameByLayer.set(layer, first ? frameByLayer.get(first) : requestAnimationFrame(renderPendingUpdates));
  return layer;
}

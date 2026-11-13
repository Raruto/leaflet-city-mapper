import { frameByLayer } from '../weakmaps/frameByLayer.js';
import { pendingUpdates } from '../globals/pendingUpdates.js';

/**
 * Remove a layer's pending update and cancel the frame when no updates remain.
 *
 * @param {L.Layer} layer Layer whose update should be cancelled.
 */
export function cancelUpdate(layer) {
  const frame = frameByLayer.get(layer);
  pendingUpdates.delete(layer);
  frameByLayer.set(layer, null);
  if (!pendingUpdates.size && frame != null) {
    cancelAnimationFrame(frame);
  }
}

import { frameByLayer } from '../weakmaps/frameByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { pendingUpdates } from '../globals/pendingUpdates.js';
import { render } from '../rendering/render.js';

/**
 * Render queued shared scenes, continuing through failures before propagating the first.
 *
 * @throws {Error} The first rendering failure, if any.
 */
export function renderPendingUpdates() {
  const updates = /* alloc */ [...pendingUpdates];
  pendingUpdates.clear();
  let failure;
  let layer;
  for (layer of updates) {
    frameByLayer.set(layer, null);
    if (sharedByLayer.get(layer) !== layer || !rendererByLayer.get(layer)) continue;
    try {
      render(layer);
    } catch (error) {
      failure ||= error;
    }
  }
  if (failure) throw failure;
}

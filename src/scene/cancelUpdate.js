import { frameByLayer } from '../weakmaps/frameByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { pendingUpdates } from '../globals/pendingUpdates.js';



export function cancelUpdate(layer) {
  const frame = frameByLayer.get(layer);
  pendingUpdates.delete(layer);
  mutateWeakMap(frameByLayer, layer, "=", null);
  if (!pendingUpdates.size && frame != null) {
    cancelAnimationFrame(frame);
  }
}

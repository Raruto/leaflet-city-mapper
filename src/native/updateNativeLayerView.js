import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { update } from '../scene/scheduleSceneUpdate.js';

/**
 * Mark the bound native layer's view dirty and schedule a render if attached.
 */
export function updateNativeLayerView() {
  this.viewDirty = true;
  if (sharedByLayer.get(this.backend)) update(this.backend);
}

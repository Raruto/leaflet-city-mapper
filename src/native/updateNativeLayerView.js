import { sharedByLayer } from '../weakmaps/sharedByLayer.js';



import { update } from '../scene/scheduleSceneUpdate.js';

export function updateNativeLayerView() {
  this.viewDirty = true;
  if (sharedByLayer.get(this.backend)) update(this.backend);
}

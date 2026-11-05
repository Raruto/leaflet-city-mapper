import { sceneByLayer } from '../globals/sceneByLayer.js';


import { update } from '../scene/update.js';

export function updateNativeLayerView() {
  this.viewDirty = true;
  if (sceneByLayer.get(this.backend)._shared) update(this.backend);
}

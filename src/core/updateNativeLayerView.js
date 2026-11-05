import { update } from '../scene/update.js';

export function updateNativeLayerView() {
  this.viewDirty = true;
  if (this.backend._shared) update(this.backend);
}

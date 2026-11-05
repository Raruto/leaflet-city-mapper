import { update } from '../lifecycle/update.js';

export function updateNativeLayerView() {
  this.viewDirty = true;
  if (this.backend._shared) update(this.backend);
}

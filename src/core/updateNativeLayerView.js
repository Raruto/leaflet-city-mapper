import { pluginState } from './pluginState.js';
import { update } from '../scene/update.js';

export function updateNativeLayerView() {
  this.viewDirty = true;
  if (pluginState(this.backend)._shared) update(this.backend);
}

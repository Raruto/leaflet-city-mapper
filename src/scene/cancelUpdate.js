import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

export function cancelUpdate(backend) {
  const frame = pluginState(backend)._frame;
  sharedState.pendingUpdates.delete(backend);
  pluginState(backend)._frame = null;
  if (!sharedState.pendingUpdates.size && frame != null) {
    cancelAnimationFrame(frame);
  }
}

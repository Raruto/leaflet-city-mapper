import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
import { showWebGPUWarning } from './showWebGPUWarning.js';

export function failAttachment(error, backend, map) {
  showWebGPUWarning(map);
  pluginState(backend)._rendererReady.reject(error);
  sharedState.renderers.delete(map);
  throw error;
}

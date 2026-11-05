import { sceneByLayer } from '../globals/sceneByLayer.js';
import { renderers } from '../globals/renderers.js';


import { showWebGPUWarning } from './showWebGPUWarning.js';

export function failAttachment(error, backend, map) {
  showWebGPUWarning(map);
  sceneByLayer.get(backend)._rendererReady.reject(error);
  renderers.delete(map);
  throw error;
}

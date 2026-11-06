import { rendererReadyByLayer } from '../weakmaps/rendererReadyByLayer.js';

import { renderers } from '../weakmaps/renderers.js';


import { showWebGPUWarning } from './showWebGPUWarning.js';

export function failAttachment(error, layer, map) {
  showWebGPUWarning(map);
  rendererReadyByLayer.get(layer).reject(error);
  renderers.delete(map);
  throw error;
}

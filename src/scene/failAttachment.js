import { showWebGPUWarning } from './showWebGPUWarning.js';
import { cityMapper } from '../constants/cityMapper.js';

export function failAttachment(error, backend, map) {
  showWebGPUWarning(map);
  backend._rendererReady.reject(error);
  cityMapper.renderers.delete(map);
  throw error;
}

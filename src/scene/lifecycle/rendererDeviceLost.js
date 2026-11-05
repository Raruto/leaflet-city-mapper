import { attachState } from './constants/attachState.js';
import { cityMapper } from '../../constants/cityMapper.js';

export function rendererDeviceLost([info, device]) {
  const map = attachState.rendererDevices.get(device);
  const owner = cityMapper.renderers.get(map);
  if (!owner || owner.renderer?.device !== device) return;
  const error = new Error(`WebGPU device lost: ${info.message || info.reason}`);
  for (const layer of owner._layers) layer.fire('error', { error });
}

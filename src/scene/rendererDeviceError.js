import { attachState } from '../constants/attachState.js';
import { cityMapper } from '../constants/cityMapper.js';

export function rendererDeviceError(event) {
  const map = attachState.rendererDevices.get(event.currentTarget);
  const owner = cityMapper.renderers.get(map);
  if (owner?.renderer?.device !== event.currentTarget) return;
  for (const layer of owner._layers || []) layer.fire('error', { error: event.error });
}

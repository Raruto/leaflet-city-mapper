import { nativeGPUBackByMap } from '../weakmaps/nativeGPUBackByMap.js';
import { nativeGPUOrderByMap } from '../weakmaps/nativeGPUOrderByMap.js';
import { refreshNativeLayer } from './refreshNativeLayer.js';

export function reorderNativeLayer(front) {
  if (front) {
    this.order = nativeGPUOrderByMap.get(this.map) + 1;
    nativeGPUOrderByMap.set(this.map, this.order);
  } else {
    this.order = nativeGPUBackByMap.get(this.map) - 1;
    nativeGPUBackByMap.set(this.map, this.order);
  }
  refreshNativeLayer(this);
}

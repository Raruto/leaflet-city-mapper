import { nativeGPUBackByMap } from '../weakmaps/nativeGPUBackByMap.js';
import { nativeGPUOrderByMap } from '../weakmaps/nativeGPUOrderByMap.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';



import { refreshNativeLayer } from './refreshNativeLayer.js';

export function reorderNativeLayer(front) {
  this.order = front ? mutateWeakMap(nativeGPUOrderByMap, this.map, "++", undefined, true) : mutateWeakMap(nativeGPUBackByMap, this.map, "--", undefined, true);
  refreshNativeLayer(this);
}

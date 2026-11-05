import { cameraByMap } from '../globals/cameraByMap.js';


import { refreshNativeLayer } from './refreshNativeLayer.js';

export function reorderNativeLayer(front) {
  this.order = front ? ++cameraByMap.get(this.map)._nativeGPUOrder : --cameraByMap.get(this.map)._nativeGPUBack;
  refreshNativeLayer(this);
}

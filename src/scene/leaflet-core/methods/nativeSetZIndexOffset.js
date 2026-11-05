import { nativeLayerMethod } from '../nativeLayerMethod.js';

export function nativeSetZIndexOffset(...args) { return nativeLayerMethod('setZIndexOffset', this, args); }

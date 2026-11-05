import { nativeLayerMethod } from '../nativeLayerMethod.js';

export function nativeSetStyle(...args) { return nativeLayerMethod('setStyle', this, args); }

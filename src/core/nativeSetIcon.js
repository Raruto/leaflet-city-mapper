import { nativeLayerMethod } from './nativeLayerMethod.js';

export function nativeSetIcon(...args) { return nativeLayerMethod('setIcon', this, args); }

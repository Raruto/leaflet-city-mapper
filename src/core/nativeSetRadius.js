import { nativeLayerMethod } from './nativeLayerMethod.js';

export function nativeSetRadius(...args) { return nativeLayerMethod('setRadius', this, args); }

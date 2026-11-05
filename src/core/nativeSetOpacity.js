import { nativeLayerMethod } from './nativeLayerMethod.js';

export function nativeSetOpacity(...args) { return nativeLayerMethod('setOpacity', this, args); }

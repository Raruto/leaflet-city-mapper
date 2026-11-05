import { nativeLayerMethod } from '../nativeLayerMethod.js';

export function nativeSetZIndex(...args) { return nativeLayerMethod('setZIndex', this, args); }

import { nativeLayerMethod } from './nativeLayerMethod.js';

export function nativeSetBounds(...args) { return nativeLayerMethod('setBounds', this, args); }

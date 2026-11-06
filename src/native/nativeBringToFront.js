import { nativeLayerMethod } from './nativeLayerMethod.js';

export function nativeBringToFront(...args) { return nativeLayerMethod('bringToFront', this, args); }

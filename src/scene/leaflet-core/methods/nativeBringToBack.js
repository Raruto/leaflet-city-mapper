import { nativeLayerMethod } from '../nativeLayerMethod.js';

export function nativeBringToBack(...args) { return nativeLayerMethod('bringToBack', this, args); }

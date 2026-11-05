import { nativeLayerMethod } from '../nativeLayerMethod.js';

export function nativeSetLatLng(...args) { return nativeLayerMethod('setLatLng', this, args); }

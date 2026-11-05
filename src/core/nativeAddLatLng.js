import { nativeLayerMethod } from './nativeLayerMethod.js';

export function nativeAddLatLng(...args) { return nativeLayerMethod('addLatLng', this, args); }

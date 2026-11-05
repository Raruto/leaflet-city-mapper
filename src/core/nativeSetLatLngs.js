import { nativeLayerMethod } from './nativeLayerMethod.js';

export function nativeSetLatLngs(...args) { return nativeLayerMethod('setLatLngs', this, args); }

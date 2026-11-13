import { nativeLayerMethod } from './nativeLayerMethod.js';

/**
 * Forward addLatLng to the native source and refresh its GPU representation.
 *
 * @param {...*} args Arguments passed to the source method.
 *
 * @returns {*} Result of the source method.
 */
export function nativeAddLatLng(...args) { return nativeLayerMethod('addLatLng', this, args); }

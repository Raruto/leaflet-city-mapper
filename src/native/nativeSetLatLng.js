import { nativeLayerMethod } from './nativeLayerMethod.js';

/**
 * Forward setLatLng and refresh the GPU representation.
 *
 * @param {...*} args Arguments passed to the source method.
 *
 * @returns {*} Result of the source method.
 */
export function nativeSetLatLng(...args) { return nativeLayerMethod('setLatLng', this, args); }

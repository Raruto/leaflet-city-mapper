import { nativeLayerMethod } from './nativeLayerMethod.js';

/**
 * Forward setLatLngs and refresh the GPU representation.
 *
 * @param {...*} args Arguments passed to the source method.
 *
 * @returns {*} Result of the source method.
 */
export function nativeSetLatLngs(...args) { return nativeLayerMethod('setLatLngs', this, args); }

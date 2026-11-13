import { nativeLayerMethod } from './nativeLayerMethod.js';

/**
 * Forward setIcon and refresh the GPU representation.
 *
 * @param {...*} args Arguments passed to the source method.
 *
 * @returns {*} Result of the source method.
 */
export function nativeSetIcon(...args) { return nativeLayerMethod('setIcon', this, args); }

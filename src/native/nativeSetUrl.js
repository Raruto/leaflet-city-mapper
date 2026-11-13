import { nativeLayerMethod } from './nativeLayerMethod.js';

/**
 * Forward setUrl and refresh the GPU representation.
 *
 * @param {...*} args Arguments passed to the source method.
 *
 * @returns {*} Result of the source method.
 */
export function nativeSetUrl(...args) { return nativeLayerMethod('setUrl', this, args); }

import { nativeLayerMethod } from './nativeLayerMethod.js';

/**
 * Forward setStyle and refresh the GPU representation.
 *
 * @param {...*} args Arguments passed to the source method.
 *
 * @returns {*} Result of the source method.
 */
export function nativeSetStyle(...args) { return nativeLayerMethod('setStyle', this, args); }

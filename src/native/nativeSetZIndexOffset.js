import { nativeLayerMethod } from './nativeLayerMethod.js';

/**
 * Forward setZIndexOffset and refresh the GPU representation.
 *
 * @param {...*} args Arguments passed to the source method.
 *
 * @returns {*} Result of the source method.
 */
export function nativeSetZIndexOffset(...args) { return nativeLayerMethod('setZIndexOffset', this, args); }

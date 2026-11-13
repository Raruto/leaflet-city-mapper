import { nativeLayerMethod } from './nativeLayerMethod.js';

/**
 * Forward setZIndex and refresh the GPU representation.
 *
 * @param {...*} args Arguments passed to the source method.
 *
 * @returns {*} Result of the source method.
 */
export function nativeSetZIndex(...args) { return nativeLayerMethod('setZIndex', this, args); }

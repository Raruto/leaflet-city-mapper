import { nativeLayerMethod } from './nativeLayerMethod.js';

/**
 * Forward setOpacity and refresh the GPU representation.
 *
 * @param {...*} args Arguments passed to the source method.
 *
 * @returns {*} Result of the source method.
 */
export function nativeSetOpacity(...args) { return nativeLayerMethod('setOpacity', this, args); }

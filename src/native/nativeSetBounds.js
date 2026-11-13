import { nativeLayerMethod } from './nativeLayerMethod.js';

/**
 * Forward setBounds and refresh the GPU representation.
 *
 * @param {...*} args Arguments passed to the source method.
 *
 * @returns {*} Result of the source method.
 */
export function nativeSetBounds(...args) { return nativeLayerMethod('setBounds', this, args); }

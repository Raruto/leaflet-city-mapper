import { nativeLayerMethod } from './nativeLayerMethod.js';

/**
 * Forward redraw and refresh the GPU representation.
 *
 * @param {...*} args Arguments passed to the source method.
 *
 * @returns {*} Result of the source method.
 */
export function nativeRedraw(...args) { return nativeLayerMethod('redraw', this, args); }

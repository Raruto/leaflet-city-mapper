import { nativeLayerMethod } from './nativeLayerMethod.js';

/**
 * Forward bringToBack and update the native layer's render order.
 *
 * @param {...*} args Arguments passed to the source method.
 *
 * @returns {*} Result of the source method.
 */
export function nativeBringToBack(...args) { return nativeLayerMethod('bringToBack', this, args); }

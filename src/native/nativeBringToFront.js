import { nativeLayerMethod } from './nativeLayerMethod.js';

/**
 * Forward bringToFront and update the native layer's render order.
 *
 * @param {...*} args Arguments passed to the source method.
 *
 * @returns {*} Result of the source method.
 */
export function nativeBringToFront(...args) { return nativeLayerMethod('bringToFront', this, args); }

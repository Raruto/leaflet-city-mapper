import { nativeLayerMethod } from '../nativeLayerMethod.js';

export function nativeSetUrl(...args) { return nativeLayerMethod('setUrl', this, args); }

import { nativeLayerMethod } from '../nativeLayerMethod.js';

export function nativeRedraw(...args) { return nativeLayerMethod('redraw', this, args); }

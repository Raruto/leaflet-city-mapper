import { pitchDragRemoveHooks } from './pitchDragRemoveHooks.js';

export function rotateOnRemove(map) {
  map.off('rotate pitch', this._refresh, this);
  pitchDragRemoveHooks.call(this);
}

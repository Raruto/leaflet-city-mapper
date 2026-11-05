import { removeRotateDrag } from './removeRotateDrag.js';

export function rotateOnRemove(map) {
  map.off('rotate pitch', this._refresh, this);
  removeRotateDrag.call(this);
}

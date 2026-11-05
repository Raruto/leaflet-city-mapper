import { removeRotateDrag } from '../gestures/removeRotateDrag.js';

export function rotateOnRemove(map) {
  map.off('rotate pitch', this._refresh, this);
  removeRotateDrag.call(this);
}

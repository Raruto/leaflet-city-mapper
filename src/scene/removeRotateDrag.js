import { removeCameraDrag } from './removeCameraDrag.js';

export function removeRotateDrag() {
  removeCameraDrag(this._dragState);
}

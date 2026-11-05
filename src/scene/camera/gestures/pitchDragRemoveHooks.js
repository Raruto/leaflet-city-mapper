import { removeCameraDrag } from './removeCameraDrag.js';

export function pitchDragRemoveHooks() {
  removeCameraDrag(this._dragState);
}

import { removeCameraDrag } from './removeCameraDrag.js';

/** Remove this handler's camera drag listeners. */
export function pitchDragRemoveHooks() {
  removeCameraDrag(this._dragState);
}

import { dragCamera } from './dragCamera.js';
import { acceptPitchDrag } from './acceptPitchDrag.js';

export function pitchDragAddHooks() {
  this._dragState = dragCamera(this._map, this._map.getContainer(), acceptPitchDrag, [0.8, 0.5], true);
}

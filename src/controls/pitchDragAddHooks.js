import { cameraDragSensitivity } from '../globals/cameraDragSensitivity.js';
import { dragCamera } from './dragCamera.js';
import { acceptPitchDrag } from './acceptPitchDrag.js';

/** Install camera pitch and orbit dragging on this handler's map container. */
export function pitchDragAddHooks() {
  this._dragState = dragCamera(this._map, this._map.getContainer(), acceptPitchDrag, cameraDragSensitivity, true);
}

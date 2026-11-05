import { dragCamera } from './dragCamera.js';
import { acceptPitchDrag } from './acceptPitchDrag.js';
import { state as sharedState } from '../state.js';

export function pitchDragAddHooks() {
  this._dragState = dragCamera(this._map, this._map.getContainer(), acceptPitchDrag, sharedState.allocationCameraDragSensitivity, true);
}

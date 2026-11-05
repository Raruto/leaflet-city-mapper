import { pitchDragAddHooks } from '../../gestures/pitchDragAddHooks.js';
import { pitchDragRemoveHooks } from '../../gestures/pitchDragRemoveHooks.js';

export const PitchDrag = L.Handler.extend({
  addHooks: pitchDragAddHooks,
  removeHooks: pitchDragRemoveHooks,
});

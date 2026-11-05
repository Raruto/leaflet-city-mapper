import { pitchDragAddHooks } from '../pitchDragAddHooks.js';
import { pitchDragRemoveHooks } from '../pitchDragRemoveHooks.js';

export const PitchDrag = L.Handler.extend({
  addHooks: pitchDragAddHooks,
  removeHooks: pitchDragRemoveHooks,
});

import { pitchDragAddHooks } from '../controls/pitchDragAddHooks.js';
import { pitchDragRemoveHooks } from '../controls/pitchDragRemoveHooks.js';

export const PitchDrag = L.Handler.extend({
  addHooks: pitchDragAddHooks,
  removeHooks: pitchDragRemoveHooks,
});

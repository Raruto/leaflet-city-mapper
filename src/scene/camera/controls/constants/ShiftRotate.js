import { shiftRotateAddHooks } from '../../gestures/shiftRotateAddHooks.js';
import { shiftRotateRemoveHooks } from '../../gestures/shiftRotateRemoveHooks.js';

export const ShiftRotate = L.Handler.extend({
  addHooks: shiftRotateAddHooks,
  removeHooks: shiftRotateRemoveHooks,
});

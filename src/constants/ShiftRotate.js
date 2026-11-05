import { shiftRotateAddHooks } from '../controls/shiftRotateAddHooks.js';
import { shiftRotateRemoveHooks } from '../controls/shiftRotateRemoveHooks.js';

export const ShiftRotate = L.Handler.extend({
  addHooks: shiftRotateAddHooks,
  removeHooks: shiftRotateRemoveHooks,
});

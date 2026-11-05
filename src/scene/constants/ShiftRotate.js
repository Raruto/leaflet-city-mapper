import { shiftRotateAddHooks } from '../shiftRotateAddHooks.js';
import { shiftRotateRemoveHooks } from '../shiftRotateRemoveHooks.js';

export const ShiftRotate = L.Handler.extend({
  addHooks: shiftRotateAddHooks,
  removeHooks: shiftRotateRemoveHooks,
});

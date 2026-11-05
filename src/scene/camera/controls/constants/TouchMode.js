import { touchModeAddHooks } from '../../gestures/touchModeAddHooks.js';
import { touchModeRemoveHooks } from '../../gestures/touchModeRemoveHooks.js';

export const TouchMode = L.Handler.extend({
  addHooks: touchModeAddHooks,
  removeHooks: touchModeRemoveHooks,
});

import { touchModeAddHooks } from '../controls/touchModeAddHooks.js';
import { touchModeRemoveHooks } from '../controls/touchModeRemoveHooks.js';

export const TouchMode = L.Handler.extend({
  addHooks: touchModeAddHooks,
  removeHooks: touchModeRemoveHooks,
});

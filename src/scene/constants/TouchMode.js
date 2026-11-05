import { touchModeAddHooks } from '../touchModeAddHooks.js';
import { touchModeRemoveHooks } from '../touchModeRemoveHooks.js';

export const TouchMode = L.Handler.extend({
  addHooks: touchModeAddHooks,
  removeHooks: touchModeRemoveHooks,
});

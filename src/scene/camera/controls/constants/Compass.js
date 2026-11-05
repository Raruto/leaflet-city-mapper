import { compassAddHooks } from '../compassAddHooks.js';
import { compassRemoveHooks } from '../compassRemoveHooks.js';

export const Compass = L.Handler.extend({
  addHooks: compassAddHooks,
  removeHooks: compassRemoveHooks,
});

import { compassAddHooks } from '../controls/compassAddHooks.js';
import { compassRemoveHooks } from '../controls/compassRemoveHooks.js';

export const Compass = L.Handler.extend({
  addHooks: compassAddHooks,
  removeHooks: compassRemoveHooks,
});

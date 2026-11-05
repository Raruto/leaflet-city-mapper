import { containerResizeAddHooks } from '../containerResizeAddHooks.js';
import { containerResizeRemoveHooks } from '../containerResizeRemoveHooks.js';

export const ContainerResize = L.Handler.extend({
  addHooks: containerResizeAddHooks,
  removeHooks: containerResizeRemoveHooks,
});

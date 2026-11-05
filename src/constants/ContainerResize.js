import { containerResizeAddHooks } from '../controls/containerResizeAddHooks.js';
import { containerResizeRemoveHooks } from '../controls/containerResizeRemoveHooks.js';

export const ContainerResize = L.Handler.extend({
  addHooks: containerResizeAddHooks,
  removeHooks: containerResizeRemoveHooks,
});

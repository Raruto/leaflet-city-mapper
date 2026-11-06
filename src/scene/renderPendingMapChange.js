import { queuedByLayer } from '../weakmaps/queuedByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { pendingMapChanges } from '../globals/pendingMapChanges.js';



import { update } from './update.js';
import { render } from '../rendering/render.js';

export function renderPendingMapChange() {
  const layer = pendingMapChanges.shift();
  mutateWeakMap(queuedByLayer, layer, "=", false);
  if (sharedByLayer.get(layer) !== layer || !rendererByLayer.get(layer)) return;
  if (layer._map._animatingZoom) update(layer);
  else render(layer);
}

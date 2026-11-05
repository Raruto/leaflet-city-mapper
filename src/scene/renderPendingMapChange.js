import { pendingMapChanges } from '../globals/pendingMapChanges.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';



import { update } from './update.js';
import { render } from '../rendering/render.js';

export function renderPendingMapChange() {
  const layer = pendingMapChanges.shift();
  sceneByLayer.get(layer)._queued = false;
  if (sceneByLayer.get(layer)._shared !== layer || !sceneByLayer.get(layer).renderer) return;
  if (layer._map._animatingZoom) update(layer);
  else render(layer);
}

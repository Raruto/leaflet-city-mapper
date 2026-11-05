import { onMapChangeState } from '../constants/onMapChangeState.js';
import { update } from './update.js';
import { render } from '../rendering/render.js';

export function renderPendingMapChange() {
  const layer = onMapChangeState.pendingMapChanges.shift();
  layer._queued = false;
  if (layer._shared !== layer || !layer.renderer) return;
  if (layer._map._animatingZoom) update(layer);
  else render(layer);
}

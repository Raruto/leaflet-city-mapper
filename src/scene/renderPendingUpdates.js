import { pendingUpdates } from '../globals/pendingUpdates.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';



import { render } from '../rendering/render.js';

export function renderPendingUpdates() {
  const updates = /* alloc */ [...pendingUpdates];
  pendingUpdates.clear();
  let failure;
  let backend;
  for (backend of updates) {
    sceneByLayer.get(backend)._frame = null;
    if (sceneByLayer.get(backend)._shared !== backend || !sceneByLayer.get(backend).renderer) continue;
    try {
      render(backend);
    } catch (error) {
      failure ||= error;
    }
  }
  if (failure) throw failure;
}

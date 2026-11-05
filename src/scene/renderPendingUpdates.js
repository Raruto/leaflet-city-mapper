import { pendingUpdates } from './constants/pendingUpdates.js';
import { render } from '../rendering/render.js';

export function renderPendingUpdates() {
  const updates = [...pendingUpdates];
  pendingUpdates.clear();
  let failure;
  for (const backend of updates) {
    backend._frame = null;
    if (backend._shared !== backend || !backend.renderer) continue;
    try {
      render(backend);
    } catch (error) {
      failure ||= error;
    }
  }
  if (failure) throw failure;
}

import { sceneByLayer } from '../globals/sceneByLayer.js';


/** Emit a snapshot for consumers; ready does not wait for all neighborhood tasks. */
export function updateStatus(backend, enabled = true) {
  const progress = /* allocation: required -- Emit an independent progress snapshot to listeners. */ { enabled, loaded: 0, skipped: 0, pending: 0, errors: /* allocation: required -- Keep collected errors independent for this event. */ [] };
  let area;
  for (area of sceneByLayer.get(backend)._areas.values()) {
    if (area.error) progress.errors.push(area.error);
    else if (!area.done) progress.pending++;
    progress.loaded += area.buildings ?? 0;
    progress.skipped += area.skipped ?? 0;
  }
  backend.fire('progress', progress);
}

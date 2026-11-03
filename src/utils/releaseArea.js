import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';

/** Cancel pending work and dispose this block's GPU data, including any hover highlight. */

export function releaseArea(backend, area) {
  area.request.abort();
  if (area.mesh) {
    if (backend.highlightedFeature?.mesh === area.mesh) {
      setHighlight(backend, null);
      backend.hoveredFeature = null;
      showFeature(backend, null);
    }
    backend.remove(area.mesh);
    const geometry = area.mesh.geometry;
    for (const attribute of Object.values(geometry.attributes)) attribute.buffer.destroy();
    area.mesh.program.pipelineCache.clear();
  }
}
/** Emit a snapshot for consumers; ready does not wait for all neighborhood tasks. */

export function updateStatus(backend, enabled = true) {
  const progress = { enabled, loaded: 0, skipped: 0, pending: 0, errors: [] };
  for (const area of backend._areas.values()) {
    if (area.error) progress.errors.push(area.error);
    else if (!area.done) progress.pending++;
    progress.loaded += area.buildings ?? 0;
    progress.skipped += area.skipped ?? 0;
  }
  backend.fire('progress', progress);
}

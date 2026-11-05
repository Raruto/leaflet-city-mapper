import { setHighlight } from '../picking/setHighlight.js';
import { showFeature } from '../picking/showFeature.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';

/** Cancel pending work and dispose this block's GPU data, including any hover highlight. */
export function releaseArea(backend, area) {
  area.request.abort();
  if (area.mesh) {
    if (backend.highlightedFeature?.mesh === area.mesh) {
      setHighlight(backend, null);
      backend.hoveredFeature = null;
      showFeature(backend, null);
    }
    setParent(area.mesh, null);
    update(backend);
    const geometry = area.mesh.geometry;
    for (const attribute of Object.values(geometry.attributes)) attribute.buffer.destroy();
    area.mesh.program.pipelineCache.clear();
  }
}

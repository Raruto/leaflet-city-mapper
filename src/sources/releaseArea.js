import { pluginState } from '../core/pluginState.js';
import { setHighlight } from '../picking/setHighlight.js';
import { showFeature } from '../picking/showFeature.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';

/** Cancel pending work and dispose this block's GPU data, including any hover highlight. */
export function releaseArea(backend, area) {
  area.request.abort();
  let attribute;
  if (area.mesh) {
    if (pluginState(backend).highlightedFeature?.mesh === area.mesh) {
      setHighlight(backend, null);
      pluginState(backend).hoveredFeature = null;
      showFeature(backend, null);
    }
    setParent(area.mesh, null);
    update(backend);
    const geometry = area.mesh.geometry;
    for (attribute of Object.values(geometry.attributes)) attribute.buffer.destroy();
    area.mesh.program.pipelineCache.clear();
  }
}

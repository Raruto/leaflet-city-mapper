import { highlightedFeatureByLayer } from '../weakmaps/highlightedFeatureByLayer.js';
import { hoveredFeatureByLayer } from '../weakmaps/hoveredFeatureByLayer.js';



import { setHighlight } from '../picking/setHighlight.js';
import { showFeature } from '../picking/showFeature.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/scheduleSceneUpdate.js';

/** Cancel pending work and dispose this block's GPU data, including any hover highlight. */
export function releaseArea(layer, area) {
  area.request.abort();
  let attribute;
  if (area.mesh) {
    if (highlightedFeatureByLayer.get(layer)?.mesh === area.mesh) {
      setHighlight(layer, null);
      hoveredFeatureByLayer.set(layer, null);
      showFeature(layer, null);
    }
    setParent(area.mesh, null);
    update(layer);
    const geometry = area.mesh.geometry;
    for (attribute of Object.values(geometry.attributes)) attribute.buffer.destroy();
    area.mesh.program.pipelineCache.clear();
  }
}

import { hoveredFeatureByLayer } from '../weakmaps/hoveredFeatureByLayer.js';
import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';

/**
 * Clear hover, highlight and tooltip without retaining a selected feature.
 *
 * @param {L.Layer} layer Layer whose hover state is cleared.
 */
export function onPointerLeave(layer) {
  hoveredFeatureByLayer.set(layer, null);
  setHighlight(layer, null);
  showFeature(layer, null);
  layer.fire('featurehover', /* alloc */ { feature: null });
}

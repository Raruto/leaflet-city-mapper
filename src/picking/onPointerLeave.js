import { hoveredFeatureByLayer } from '../weakmaps/hoveredFeatureByLayer.js';



import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';

/** Clear hover, highlight and tooltip without retaining a selected feature. */

export function onPointerLeave(layer) {
  hoveredFeatureByLayer.set(layer, null);
  setHighlight(layer, null);
  showFeature(layer, null);
  layer.fire('featurehover', /* alloc */ { feature: null });
}

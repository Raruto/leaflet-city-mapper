import { hoveredFeatureByLayer } from '../weakmaps/hoveredFeatureByLayer.js';



import { findFeature } from './findFeature.js';
import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';

/** Hover is transient; featurehover also reports misses with feature:null. */

export function onPointerMove(layer, event) {
  hoveredFeatureByLayer.set(layer, findFeature(layer, event));
  setHighlight(layer, hoveredFeatureByLayer.get(layer));
  showFeature(layer, hoveredFeatureByLayer.get(layer), event);
  layer.fire('featurehover', /* alloc */ {
    feature: hoveredFeatureByLayer.get(layer),
    originalEvent: event
  });
}

import { findFeature } from './findFeature.js';
import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';

/** Hover is transient; featurehover also reports misses with feature:null. */

export function onPointerMove(layer, event) {
  layer.hoveredFeature = findFeature(layer, event);
  setHighlight(layer, layer.hoveredFeature);
  showFeature(layer, layer.hoveredFeature, event);
  layer.fire('featurehover', {
    feature: layer.hoveredFeature,
    originalEvent: event
  });
}

import { hoveredFeatureByLayer } from '../weakmaps/hoveredFeatureByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';



import { findFeature } from './findFeature.js';
import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';

/** Emit click without moving the map or pinning the tooltip. */

export function onClick(layer, event) {
  const feature = findFeature(layer, event);
  mutateWeakMap(hoveredFeatureByLayer, layer, "=", feature);
  setHighlight(layer, feature);
  showFeature(layer, feature, event);
  layer.fire('featureclick', /* alloc */ { feature, originalEvent: event });
}

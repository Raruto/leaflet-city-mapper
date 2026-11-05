import { sceneByLayer } from '../globals/sceneByLayer.js';


import { findFeature } from './findFeature.js';
import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';

/** Emit click without moving the map or pinning the tooltip. */

export function onClick(layer, event) {
  const feature = findFeature(layer, event);
  sceneByLayer.get(layer).hoveredFeature = feature;
  setHighlight(layer, feature);
  showFeature(layer, feature, event);
  layer.fire('featureclick', /* allocation: required -- Event listeners own this click payload. */ { feature, originalEvent: event });
}

import { sceneByLayer } from '../globals/sceneByLayer.js';


import { findFeature } from './findFeature.js';
import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';

/** Hover is transient; featurehover also reports misses with feature:null. */

export function onPointerMove(layer, event) {
  sceneByLayer.get(layer).hoveredFeature = findFeature(layer, event);
  setHighlight(layer, sceneByLayer.get(layer).hoveredFeature);
  showFeature(layer, sceneByLayer.get(layer).hoveredFeature, event);
  layer.fire('featurehover', /* allocation: required -- Event listeners own each hover payload. */ {
    feature: sceneByLayer.get(layer).hoveredFeature,
    originalEvent: event
  });
}

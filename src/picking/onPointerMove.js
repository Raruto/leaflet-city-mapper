import { pluginState } from '../core/pluginState.js';
import { findFeature } from './findFeature.js';
import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';

/** Hover is transient; featurehover also reports misses with feature:null. */

export function onPointerMove(layer, event) {
  pluginState(layer).hoveredFeature = findFeature(layer, event);
  setHighlight(layer, pluginState(layer).hoveredFeature);
  showFeature(layer, pluginState(layer).hoveredFeature, event);
  layer.fire('featurehover', /* allocation: required -- Event listeners own each hover payload. */ {
    feature: pluginState(layer).hoveredFeature,
    originalEvent: event
  });
}

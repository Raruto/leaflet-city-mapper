import { pluginState } from '../core/pluginState.js';
import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';

/** Clear hover, highlight and tooltip without retaining a selected feature. */

export function onPointerLeave(layer) {
  pluginState(layer).hoveredFeature = null;
  setHighlight(layer, null);
  showFeature(layer, null);
  layer.fire('featurehover', /* allocation: required -- Event listeners own this leave payload. */ { feature: null });
}

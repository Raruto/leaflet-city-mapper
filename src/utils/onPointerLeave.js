import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';

/** Clear hover, highlight and tooltip without retaining a selected feature. */

export function onPointerLeave(backend) {
  backend.hoveredFeature = null;
  setHighlight(backend, null);
  showFeature(backend, null);
  backend.fire('featurehover', { feature: null });
}

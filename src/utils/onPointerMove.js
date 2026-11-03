import { findFeature } from './findFeature.js';
import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';

/** Hover is transient; featurehover also reports misses with feature:null. */

export function onPointerMove(backend, event) {
  backend.hoveredFeature = findFeature(backend, event);
  setHighlight(backend, backend.hoveredFeature);
  showFeature(backend, backend.hoveredFeature, event);
  backend.fire('featurehover', { feature: backend.hoveredFeature, originalEvent: event });
}

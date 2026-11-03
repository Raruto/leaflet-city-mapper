import { findFeature } from './findFeature';
import { setHighlight } from './setHighlight';
import { showFeature } from './showFeature';

/** Hover is transient; featurehover also reports misses with feature:null. */

export function onPointerMove(backend, event) {
  backend.hoveredFeature = findFeature(backend, event);
  setHighlight(backend, backend.hoveredFeature);
  showFeature(backend, backend.hoveredFeature, event);
  backend.fire('featurehover', { feature: backend.hoveredFeature, originalEvent: event });
}

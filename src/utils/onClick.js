import { findFeature } from './findFeature';
import { setHighlight } from './setHighlight';
import { showFeature } from './showFeature';

/** Emit click without moving the map or pinning the tooltip. */

export function onClick(backend, event) {
  const feature = findFeature(backend, event);
  backend.hoveredFeature = feature;
  setHighlight(backend, feature);
  showFeature(backend, feature, event);
  backend.fire('featureclick', { feature, originalEvent: event });
}

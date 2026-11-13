import { hoveredFeatureByLayer } from '../weakmaps/hoveredFeatureByLayer.js';
import { findFeature } from './findFeature.js';
import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';

/**
 * Emit click without moving the map or pinning the tooltip.
 *
 * @param {L.Layer} layer Layer receiving the click.
 * @param {MouseEvent} event Pointer event.
 */
export function onClick(layer, event) {
  const feature = findFeature(layer, event);
  hoveredFeatureByLayer.set(layer, feature);
  setHighlight(layer, feature);
  showFeature(layer, feature, event);
  layer.fire('featureclick', /* alloc */ { feature, originalEvent: event });
}

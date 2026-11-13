import { hoveredFeatureByLayer } from '../weakmaps/hoveredFeatureByLayer.js';
import { findFeature } from './findFeature.js';
import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';
import { onPointerLeave } from './onPointerLeave.js';

/**
 * Clear hover during gestures; otherwise raycast and report the current feature or a miss.
 *
 * @param {L.Layer} layer Layer receiving the pointer movement.
 * @param {PointerEvent} event Pointer movement event.
 */
export function onPointerMove(layer, event) {
  if (event.buttons || layer._map.dragging?.moving() || layer._map._animatingZoom) {
    if (hoveredFeatureByLayer.get(layer)) onPointerLeave(layer);
    return;
  }
  hoveredFeatureByLayer.set(layer, findFeature(layer, event));
  setHighlight(layer, hoveredFeatureByLayer.get(layer));
  showFeature(layer, hoveredFeatureByLayer.get(layer), event);
  layer.fire('featurehover', /* alloc */ {
    feature: hoveredFeatureByLayer.get(layer),
    originalEvent: event
  });
}

import { hoveredFeatureByLayer } from '../weakmaps/hoveredFeatureByLayer.js';



import { findFeature } from './findFeature.js';
import { setHighlight } from './setHighlight.js';
import { showFeature } from './showFeature.js';
import { onPointerLeave } from './onPointerLeave.js';

/** Gestures clear hover once without raycasting; normal misses report feature:null. */

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

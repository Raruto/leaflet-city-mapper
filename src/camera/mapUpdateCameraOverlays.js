import { L } from '../globals/L.js';

/**
 * Refresh marker, popup and tooltip positions for a camera change.
 *
 * @param {L.Map} map Map containing the overlays.
 */
export function mapUpdateCameraOverlays(map) {
  let layer;
  for (layer of Object.values(map._layers)) {
    if (layer instanceof L.Marker) layer.update();
    else if (layer instanceof L.Popup || layer instanceof L.Tooltip) layer._updatePosition();
  }
}

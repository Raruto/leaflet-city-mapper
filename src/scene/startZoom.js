import { pluginState } from '../core/pluginState.js';
/** Preserve the outgoing tile level before Leaflet changes its logical zoom. */

export function startZoom() {
  pluginState(this)._zoomLevel = null;
}

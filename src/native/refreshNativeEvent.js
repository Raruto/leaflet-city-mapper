import { refreshNativeLayer } from './refreshNativeLayer.js';
import { L } from '../globals/L.js';
import { update } from '../scene/scheduleSceneUpdate.js';

export function refreshNativeEvent(event) {
  if (event?.type === 'zoomend' && this.source instanceof L.Polyline &&
    (!this.source.options.stroke || !(Number(this.source.options.weight) > 0))) return;
  if (event?.type === 'zoomend' && this.strokeCoordinates && (!this.dirty || this.zoomOnly)) {
    this.zoomOnly = true;
    this.dirty = true;
    update(this.backend);
    return;
  }
  if (event?.type === 'terrainchange' && this.marker) this.source.update();
  refreshNativeLayer(this);
}

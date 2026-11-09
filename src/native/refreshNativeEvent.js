import { refreshNativeLayer } from './refreshNativeLayer.js';

export function refreshNativeEvent(event) {
  if (event?.type === 'terrainchange' && this.marker) this.source.update();
  refreshNativeLayer(this);
}

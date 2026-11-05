import { state as sharedState } from '../state.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';

import { pointOf } from '../camera/pointOf.js';

export function popupAdjustPan() {
  const map = this._map;
  if (!mapGetPitch(map) && !mapGetBearing(map)) return sharedState.popupPan.call(this);
  if (!this.options.autoPan) return;
  if (map._panAnim) map._panAnim.stop();
  if (this._autopanning) { this._autopanning = false; return; }
  const rect = this._container.getBoundingClientRect(), container = map.getContainer().getBoundingClientRect();
  const min = pointOf(this.options.autoPanPaddingTopLeft || this.options.autoPanPadding);
  const max = map.getSize().subtract(pointOf(this.options.autoPanPaddingBottomRight || this.options.autoPanPadding));
  const left = rect.left - container.left, top = rect.top - container.top;
  const right = rect.right - container.left, bottom = rect.bottom - container.top;
  const dx = Math.min(0, left - min.x) || Math.max(0, right - max.x);
  const dy = Math.min(0, top - min.y) || Math.max(0, bottom - max.y);
  if (!dx && !dy) return;
  if (this.options.keepInView) this._autopanning = true;
  const screen = map.latLngToContainerPoint(this._latlng);
  screen.x -= dx;
  screen.y -= dy;
  const delta = map.latLngToLayerPoint(this._latlng).subtract(map.containerPointToLayerPoint(screen));
  map.fire('autopanstart');
  map.panTo(map.unproject(map.project(map.getCenter()).add(delta)));
}

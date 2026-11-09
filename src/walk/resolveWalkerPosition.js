import { L } from '../globals/L.js';
import { insideWalker } from '../collision/insideWalker.js';

export function resolveWalkerPosition() {
  if (!this.saved || !insideWalker(this)) return false;
  const map = this.layer._map;
  const origin = this.state.latlng;
  const height = this.state.height;
  let distance, angle, candidate;
  for (distance = 0.5; distance <= 20; distance += 0.5) {
    for (angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      candidate = /* alloc */ new L.LatLng(
        origin.lat + Math.cos(angle) * distance / 111320,
        origin.lng + Math.sin(angle) * distance / (111320 * Math.cos(origin.lat * Math.PI / 180))
      );
      this.state.latlng = candidate;
      this.state.height = 0;
      if (!insideWalker(this)) {
        this.verticalSpeed = 0;
        map.setView(candidate, map.getZoom(), /* alloc */ { animate: false });
        return true;
      }
    }
  }
  this.state.latlng = origin;
  this.state.height = height;
  return false;
}

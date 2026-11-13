import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { L } from '../globals/L.js';
import { radians } from '../globals/radians.js';
import { local } from '../projections/walkerLocalPosition.js';
import { blocked } from './isWalkBlocked.js';

/**
 * Move along the walker's heading, maintaining wall clearance and sliding along obstacles.
 *
 * @param {number} forward Signed movement direction.
 * @param {number} dt Frame duration in seconds.
 */
export function moveWalker(forward, dt) {
  const metres = forward * this.speed * dt, { lat, lng } = this.state.latlng;
  const { position, scale } = rootByLayer.get(this.layer);
  let east = Math.sin(this.state.heading) * metres, north = Math.cos(this.state.heading) * metres;
  const feet = local.call(this, this.local);
  let i;
  for (i = 0; i < feet.length; i++) feet[i] = position[i] + scale[i] * feet[i];
  // World x is east, z south; keep 0.3 m from walls and slide along them.
  const wall = blocked.call(this, east, north, feet);
  if (wall) {
    const fraction = Math.max(0, Math.min(1, (this.hitData.best - 0.3) / Math.hypot(east, north)));
    const movedEast = east * fraction, movedNorth = north * fraction;
    feet[0] += movedEast; feet[2] -= movedNorth;
    east -= movedEast; north -= movedNorth;
    const into = Math.min(0, east * wall[0] - north * wall[1]);
    east -= into * wall[0]; north += into * wall[1];
    if (blocked.call(this, east, north, feet)) {
      const slide = Math.max(0, Math.min(1, (this.hitData.best - 0.3) / Math.hypot(east, north)));
      east *= slide; north *= slide;
    }
    east += movedEast; north += movedNorth;
  }
  this.state.latlng = /* alloc */ new L.LatLng(lat + north / 111320, lng + east / (111320 * Math.cos(lat * radians)));
  this.state.phase += Math.hypot(east, north) / 1.6 * Math.PI;
}

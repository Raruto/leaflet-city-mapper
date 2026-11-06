import { rootByLayer } from '../weakmaps/rootByLayer.js';

import { L } from '../globals/L.js';
import { radians } from '../globals/radians.js';
import { local } from './local.js';
import { blocked } from './blocked.js';

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
    const into = east * wall[0] - north * wall[1];
    east -= into * wall[0]; north += into * wall[1];
    if (blocked.call(this, east, north, feet)) east = north = 0;
  }
  this.state.latlng = /* alloc */ new L.LatLng(lat + north / 111320, lng + east / (111320 * Math.cos(lat * radians)));
  this.state.phase += Math.hypot(east, north) / 1.6 * Math.PI;
}

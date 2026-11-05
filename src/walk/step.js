import { degrees } from '../globals/degrees.js';
import { radians } from '../globals/radians.js';
import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { limbs } from '../globals/limbs.js';
import { parts } from '../globals/parts.js';
import { moves } from '../globals/moves.js';

import { mapGetBearing } from '../camera/mapGetBearing.js';
import { mapSetPitchAndBearing } from '../camera/mapSetPitchAndBearing.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';

import * as createMesh from '../rendering/createMesh.js';
import { build } from '../geometry/build.js';

import { wrap } from '../utils/wrap.js';
import { local } from './local.js';
import { place } from './place.js';
import { blocked } from './blocked.js';
import { land } from './land.js';

export function step(now) {
  const layer = this.layer, map = layer._map;
  this.frame = requestAnimationFrame(this.step);
  const dt = Math.min(0.1, (now - (this.last ?? now)) / 1000);
  this.last = now;
  if (!sceneByLayer.get(layer).renderer) return;
  let changed = false;
  let part, key, i;
  if (!this.meshes) {
    this.meshes = /* alloc */ [];
    for ([part] of limbs) this.meshes.push(createMesh.createMesh(layer, build(parts[part])));
    changed = true;
  }
  const previousY = sceneByLayer.get(layer).root.position[1] +
    local.call(this, this.local)[1] * sceneByLayer.get(layer).root.scale[1];
  if (this.keys.has('Space')) {
    this.verticalSpeed = 6;
    this.state.height += this.verticalSpeed * dt;
    changed = true;
  } else if (this.verticalSpeed || this.state.height) {
    this.state.height = Math.max(0, this.state.height + this.verticalSpeed * dt - 9.81 * dt * dt / 2);
    this.verticalSpeed = this.state.height > 0 ? this.verticalSpeed - 9.81 * dt : 0;
    changed = true;
  }
  let forward = 0, turn = 0;
  for (key of this.keys) { forward += moves[key]?.[0] || 0; turn += moves[key]?.[1] || 0; }
  forward = Math.sign(forward); turn = Math.sign(turn);
  if (turn) { this.state.heading = wrap(this.state.heading + turn * 2.5 * dt); changed = true; }
  if (forward) {
    const metres = forward * this.speed * dt, { lat, lng } = this.state.latlng, { position, scale } = sceneByLayer.get(layer).root;
    let east = Math.sin(this.state.heading) * metres, north = Math.cos(this.state.heading) * metres;
    const feet = local.call(this, this.local);
    for (i = 0; i < feet.length; i++) feet[i] = position[i] + scale[i] * feet[i];
    // World x is east, z south; keep 0.3 m from walls and slide along the one in the way.
    const wall = blocked.call(this, east, north, feet);
    if (wall) {
      const into = east * wall[0] - north * wall[1];
      east -= into * wall[0]; north += into * wall[1];
      if (blocked.call(this, east, north, feet)) east = north = 0;
    }
    this.state.latlng = /* alloc */ new L.LatLng(lat + north / 111320, lng + east / (111320 * Math.cos(lat * radians)));
    this.state.phase += Math.hypot(east, north) / 1.6 * Math.PI;
    changed = true;
  }
  if (changed) land.call(this, previousY);
  if (forward || turn) {
    // The camera (looking along -bearing) swings back behind the walker.
    const bearing = mapGetBearing(map) * radians, behind = wrap(-this.state.heading - bearing);
    if (Math.abs(behind) > 1e-3) mapSetPitchAndBearing(map, mapGetPitch(map), (bearing + behind * Math.min(1, dt * 4)) * degrees);
    map.setView(this.state.latlng, map.getZoom(), /* alloc */ { animate: false });
  }
  const target = forward ? 0.9 : 0;
  if (Math.abs(this.swing - target) > 1e-3) { this.swing += (target - this.swing) * Math.min(1, dt * 10); changed = true; }
  if (changed) place.call(this);
}

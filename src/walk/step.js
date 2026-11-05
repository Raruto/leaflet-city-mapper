import * as createMesh from '../rendering/meshes/createMesh.js';
import { build } from '../geometry/build.js';
import { limbs } from './constants/limbs.js';
import { moves } from './constants/moves.js';
import { parts } from './constants/parts.js';
import { wrap } from '../utils/wrap.js';
import { local } from './local.js';
import { place } from './place.js';
import { blocked } from './blocked.js';

export function step(now) {
  const layer = this.layer, map = layer._map;
  this.frame = requestAnimationFrame(this.step);
  const dt = Math.min(0.1, (now - (this.last ?? now)) / 1000);
  this.last = now;
  if (!layer.renderer) return;
  let changed = false;
  if (!this.meshes) {
    this.meshes = [];
    for (const [part] of limbs) this.meshes.push(createMesh.createMesh(layer, build(parts[part])));
    changed = true;
  }
  let forward = 0, turn = 0;
  for (const key of this.keys) { forward += moves[key]?.[0] || 0; turn += moves[key]?.[1] || 0; }
  forward = Math.sign(forward); turn = Math.sign(turn);
  if (turn) { this.state.heading = wrap(this.state.heading + turn * 2.5 * dt); changed = true; }
  if (forward) {
    const metres = forward * this.speed * dt, { lat, lng } = this.state.latlng, { position, scale } = layer.root;
    let east = Math.sin(this.state.heading) * metres, north = Math.cos(this.state.heading) * metres;
    const feet = local.call(this);
    for (let i = 0; i < feet.length; i++) feet[i] = position[i] + scale[i] * feet[i];
    // World x is east, z south; keep 0.3 m from walls and slide along the one in the way.
    const wall = blocked.call(this, east, north, feet);
    if (wall) {
      const into = east * wall[0] - north * wall[1];
      east -= into * wall[0]; north += into * wall[1];
      if (blocked.call(this, east, north, feet)) east = north = 0;
    }
    this.state.latlng = new L.LatLng(lat + north / 111320, lng + east / (111320 * Math.cos(lat * Math.PI / 180)));
    this.state.phase += Math.hypot(east, north) / 1.6 * Math.PI;
    changed = true;
  }
  if (forward || turn) {
    // The camera (looking along -bearing) swings back behind the walker.
    const bearing = map.getBearing() * Math.PI / 180, behind = wrap(-this.state.heading - bearing);
    if (Math.abs(behind) > 1e-3) map._setPitchAndBearing(map.getPitch(), (bearing + behind * Math.min(1, dt * 4)) * 180 / Math.PI);
    map.setView(this.state.latlng, map.getZoom(), { animate: false });
  }
  const target = forward ? 0.9 : 0;
  if (Math.abs(this.swing - target) > 1e-3) { this.swing += (target - this.swing) * Math.min(1, dt * 10); changed = true; }
  if (changed) place.call(this);
}

import * as createMesh from '../rendering/createMesh.js';
import * as disposeMesh from '../rendering/disposeMesh.js';
import * as update from '../scene/update.js';
import { build } from '../geometry/build.js';
import { getElevation } from '../terrain/getElevation.js';
import { hit } from '../scene/hit.js';
import { limbs } from './limbs.js';
import { moves } from './moves.js';
import { parts } from './parts.js';
import { wrap } from '../utils/wrap.js';

export function local() {
  const { layer, state } = this;
  const map = layer._map, crs = map.options.crs, origin = crs.project(layer.location);
  const metres = Math.cos(layer.location.lat * Math.PI / 180);
  const p = crs.project(state.latlng), terrain = map._terrain3D?._terrainReady && map._terrain3D;
  const ground = (terrain && getElevation(terrain, state.latlng)) || 0;
  return [(p.x - origin.x) * metres, ground - layer.root.position[1], -(p.y - origin.y) * metres];
}

export function place() {
  const [x, y, z] = local.call(this);
  // Model forward is -z; a yaw of -heading turns it to the compass heading (x east, -z north).
  const yaw = -this.state.heading, cos = Math.cos(yaw), sin = Math.sin(yaw);
  for (let i = 0; i < limbs.length; i++) {
    const [, px, py, sign] = limbs[i];
    const mesh = this.meshes[i];
    mesh.position[0] = x + px * cos; mesh.position[1] = y + py; mesh.position[2] = z - px * sin;
    mesh.rotation[0] = sign * this.swing * Math.sin(this.state.phase);
    mesh.rotation[1] = yaw;
  }
  update.update(this.layer);
}

export function blocked(east, north, feet) {
  const length = Math.hypot(east, north);
  return length > 1e-6 && hit(this.layer, feet[0], feet[1], feet[2], east / length, -north / length, length + 0.3);
}

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

export function onKey(event) {
  // Text fields and sliders keep their keys; buttons and checkboxes don't.
  if (event.target.closest?.('input:not([type=checkbox], [type=radio]), select, textarea, [contenteditable]') ||
    event.ctrlKey || event.altKey || event.metaKey) return;
  if (event.type === 'keydown' && event.code === 'Escape') { this.stop(); return; }
  if (!moves[event.code]) return;
  event.preventDefault();
  if (event.type === 'keydown') this.keys.add(event.code); else this.keys.delete(event.code);
}

export function onBlur() {
  this.keys.clear();
}

export function onPointer(event) {
  // Dragging only turns the camera around the walker: horizontal = bearing, vertical = pitch.
  const map = this.layer._map;
  if (event.type === 'pointerdown') {
    if (event.button !== 0 || event.target.closest('.leaflet-control')) return;
    this.drag = { x: event.clientX, y: event.clientY };
    map.getContainer().setPointerCapture(event.pointerId);
  } else if (this.drag && event.type === 'pointermove') {
    map._setPitchAndBearing(Math.max(20, Math.min(85, map.getPitch() - (event.clientY - this.drag.y) * 0.2)),
      map.getBearing() - (event.clientX - this.drag.x) * 0.25);
    this.drag = { x: event.clientX, y: event.clientY };
  } else this.drag = null;
}

export function onTerrain() {
  if (this.meshes) place.call(this);
}

export function start() {
  const map = this.layer._map;
  if (this.saved || !map) return;
  this.state.latlng = map.getCenter();
  // Zoom whose camera distance (1.5 viewport heights, as in scene/render.js) is about `distance` metres behind the walker.
  const pixelsPerMetre = map.getSize().y * 1.5 / this.distance;
  const zoom = Math.min(map.getMaxZoom(), Math.log2(pixelsPerMetre * 40075016.68557849 * Math.cos(this.state.latlng.lat * Math.PI / 180) / 256));
  const handlers = [];
  for (const name of ['dragging', 'keyboard', 'doubleClickZoom', 'boxZoom']) {
    if (map[name]?.enabled()) handlers.push(name);
  }
  this.saved = {
    zoom: map.getZoom(), pitch: map.getPitch(), scrollWheelZoom: map.options.scrollWheelZoom, handlers
  };
  for (const name of this.saved.handlers) map[name].disable();
  // Wheel zoom moves the camera closer or farther, keeping the walker centred.
  map.options.scrollWheelZoom = this.saved.scrollWheelZoom && 'center';
  this.state.heading = -map.getBearing() * Math.PI / 180;
  map.setView(this.state.latlng, zoom, { animate: false });
  map.setPitch(75);
  L.DomEvent.on(document, 'keydown keyup', this.onKey);
  L.DomEvent.on(window, 'blur', this.onBlur);
  L.DomEvent.on(map.getContainer(), 'pointerdown pointermove pointerup pointercancel', this.onPointer);
  map.on('terrainchange', this.onTerrain);
  this.button.setAttribute('aria-pressed', 'true');
  this.button.style.background = '#e4e4e4';
  this.hint.style.display = '';
  this.last = undefined;
  this.frame = requestAnimationFrame(this.step);
}

export function stop() {
  const map = this.layer._map;
  cancelAnimationFrame(this.frame);
  this.keys.clear(); this.drag = null;
  L.DomEvent.off(document, 'keydown keyup', this.onKey);
  L.DomEvent.off(window, 'blur', this.onBlur);
  for (const mesh of this.meshes || []) disposeMesh.disposeMesh(this.layer, mesh);
  this.meshes = null;
  this.button.setAttribute('aria-pressed', 'false');
  this.button.style.background = '#fff';
  this.hint.style.display = 'none';
  if (!map || !this.saved) return;
  L.DomEvent.off(map.getContainer(), 'pointerdown pointermove pointerup pointercancel', this.onPointer);
  map.off('terrainchange', this.onTerrain);
  map.options.scrollWheelZoom = this.saved.scrollWheelZoom;
  for (const name of this.saved.handlers) map[name].enable();
  map.setView(this.state.latlng, this.saved.zoom, { animate: false });
  map.setPitch(this.saved.pitch);
  this.saved = null;
}

export function toggle() {
  if (this.saved) stop.call(this); else start.call(this);
}

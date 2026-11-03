import * as createMesh from './createMesh.js';
import * as disposeMesh from './disposeMesh.js';
import * as render from './render.js';
import * as update from "./update.js";
import { build } from './build.js';
import { hit } from './hit.js';
import { limbs } from './limbs.js';
import { moves } from './moves.js';
import { parts } from './parts.js';
import { wrap } from './wrap.js';

export function installWalk(layer, {
    speed = 70,
    distance = 20,
    position = 'bottomright',
    ...options
  } = {}) {
  L.Layer.types['3d'].prototype.initialize.call(layer, options);
  const keys = new Set();
  // Map button (leaflet-bar look) toggling the walk; the key hint shows beside it while walking.
  const control = new L.Control({ position });
  const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
  container.style.cssText = 'display:flex;align-items:center;background:#fff;';
  const button = L.DomUtil.create('button', '', container);
  button.type = 'button';
  button.title = 'Walk';
  button.setAttribute('aria-label', 'Walk');
  button.setAttribute('aria-pressed', 'false');
  button.textContent = '🚶';
  button.style.cssText = 'width:30px;height:30px;padding:0;border:0;border-radius:4px;background:#fff;font-size:18px;line-height:30px;cursor:pointer;';
  const hint = L.DomUtil.create('small', '', container);
  hint.style.cssText = 'display:none;padding:0 8px;color:#333;white-space:nowrap;';
  hint.textContent = 'W/S: run · A/D: turn · drag: look around · Esc: exit';
  L.DomEvent.disableClickPropagation(container);
  control.onAdd = () => container;
  let meshes, frame, last, swing = 0, saved, drag;
  // Walker state: position, compass heading (radians, clockwise from north) and stride phase.
  const state = layer.walker = { latlng: null, heading: 0, phase: 0 };

  // Feet position in this layer's root space.
  const local = () => {
    const map = layer._map, crs = map.options.crs, origin = crs.project(layer.location), metres = Math.cos(layer.location.lat * Math.PI / 180);
    const p = crs.project(state.latlng), terrain = map._terrain3D?._terrainReady && map._terrain3D;
    const ground = (terrain && terrain._getElevation(state.latlng)) || 0;
    return [(p.x - origin.x) * metres, ground - layer.root.position[1], -(p.y - origin.y) * metres];
  };
  const place = () => {
    const [x, y, z] = local();
    // Model forward is -z; a yaw of -heading turns it to the compass heading (x east, -z north).
    const yaw = -state.heading, cos = Math.cos(yaw), sin = Math.sin(yaw);
    limbs.forEach(([, px, py, sign], i) => {
      const mesh = meshes[i];
      mesh.position[0] = x + px * cos; mesh.position[1] = y + py; mesh.position[2] = z - px * sin;
      mesh.rotation[0] = sign * swing * Math.sin(state.phase);
      mesh.rotation[1] = yaw;
    });
    update.update(layer);
  };

  const step = now => {
    frame = requestAnimationFrame(step);
    const map = layer._map, dt = Math.min(0.1, (now - (last ?? now)) / 1000);
    last = now;
    if (!layer.renderer) return;
    let changed = false;
    if (!meshes) { meshes = limbs.map(([part]) => createMesh.createMesh(layer, build(parts[part]))); changed = true; }
    let forward = 0, turn = 0;
    for (const key of keys) { forward += moves[key]?.[0] || 0; turn += moves[key]?.[1] || 0; }
    forward = Math.sign(forward); turn = Math.sign(turn);
    if (turn) { state.heading = wrap(state.heading + turn * 2.5 * dt); changed = true; }
    if (forward) {
      const metres = forward * speed * dt, { lat, lng } = state.latlng, { position, scale } = layer.root;
      let east = Math.sin(state.heading) * metres, north = Math.cos(state.heading) * metres;
      const feet = local().map((value, i) => position[i] + scale[i] * value);
      // World x is east, z south; keep 0.3 m from walls and slide along the one in the way.
      const blocked = () => {
        const length = Math.hypot(east, north);
        return length > 1e-6 && hit(layer, feet[0], feet[1], feet[2], east / length, -north / length, length + 0.3);
      };
      const wall = blocked();
      if (wall) {
        const into = east * wall[0] - north * wall[1];
        east -= into * wall[0]; north += into * wall[1];
        if (blocked()) east = north = 0;
      }
      state.latlng = new L.LatLng(lat + north / 111320, lng + east / (111320 * Math.cos(lat * Math.PI / 180)));
      state.phase += Math.hypot(east, north) / 1.6 * Math.PI;
      changed = true;
    }
    if (forward || turn) {
      // The camera (looking along -bearing) swings back behind the walker.
      const bearing = map.getBearing() * Math.PI / 180, behind = wrap(-state.heading - bearing);
      if (Math.abs(behind) > 1e-3) map._setPitchAndBearing(map.getPitch(), (bearing + behind * Math.min(1, dt * 4)) * 180 / Math.PI);
      map.setView(state.latlng, map.getZoom(), { animate: false });
    }
    const target = forward ? 0.9 : 0;
    if (Math.abs(swing - target) > 1e-3) { swing += (target - swing) * Math.min(1, dt * 10); changed = true; }
    if (changed) place();
  };

  const onKey = event => {
    // Text fields and sliders keep their keys; buttons and checkboxes (e.g. the Walk button, focused once clicked) don't.
    if (event.target.closest?.('input:not([type=checkbox], [type=radio]), select, textarea, [contenteditable]') ||
      event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.type === 'keydown' && event.code === 'Escape') { stop(); return; }
    if (!moves[event.code]) return;
    event.preventDefault();
    if (event.type === 'keydown') keys.add(event.code); else keys.delete(event.code);
  };
  const onBlur = () => keys.clear();
  // Dragging only turns the camera around the walker: horizontal = bearing, vertical = pitch.
  const onPointer = event => {
    const map = layer._map;
    if (event.type === 'pointerdown') {
      if (event.button !== 0 || event.target.closest('.leaflet-control')) return;
      drag = { x: event.clientX, y: event.clientY };
      map.getContainer().setPointerCapture(event.pointerId);
    } else if (drag && event.type === 'pointermove') {
      map._setPitchAndBearing(Math.max(20, Math.min(85, map.getPitch() - (event.clientY - drag.y) * 0.2)),
        map.getBearing() - (event.clientX - drag.x) * 0.25);
      drag = { x: event.clientX, y: event.clientY };
    } else drag = null;
  };
  const onTerrain = () => { if (meshes) place(); };

  const start = () => {
    const map = layer._map;
    if (saved || !map) return;
    state.latlng = map.getCenter();
    // Zoom whose camera distance (1.5 viewport heights, as in scene/render.js) is about `distance` metres behind the walker.
    const pixelsPerMetre = map.getSize().y * 1.5 / distance;
    const zoom = Math.min(map.getMaxZoom(), Math.log2(pixelsPerMetre * 40075016.68557849 * Math.cos(state.latlng.lat * Math.PI / 180) / 256));
    saved = {
      zoom: map.getZoom(), pitch: map.getPitch(), scrollWheelZoom: map.options.scrollWheelZoom,
      handlers: ['dragging', 'keyboard', 'doubleClickZoom', 'boxZoom'].filter(name => map[name]?.enabled())
    };
    for (const name of saved.handlers) map[name].disable();
    // Wheel zoom moves the camera closer or farther, keeping the walker centred.
    map.options.scrollWheelZoom = saved.scrollWheelZoom && 'center';
    state.heading = -map.getBearing() * Math.PI / 180;
    map.setView(state.latlng, zoom, { animate: false });
    map.setPitch(75);
    L.DomEvent.on(document, 'keydown keyup', onKey);
    L.DomEvent.on(window, 'blur', onBlur);
    L.DomEvent.on(map.getContainer(), 'pointerdown pointermove pointerup pointercancel', onPointer);
    map.on('terrainchange', onTerrain);
    button.setAttribute('aria-pressed', 'true');
    button.style.background = '#e4e4e4';
    hint.style.display = '';
    last = undefined;
    frame = requestAnimationFrame(step);
  };
  const stop = () => {
    const map = layer._map;
    cancelAnimationFrame(frame);
    keys.clear(); drag = null;
    L.DomEvent.off(document, 'keydown keyup', onKey);
    L.DomEvent.off(window, 'blur', onBlur);
    for (const mesh of meshes || []) {
      disposeMesh.disposeMesh(layer, mesh);
    }
    meshes = null;
    button.setAttribute('aria-pressed', 'false');
    button.style.background = '#fff';
    hint.style.display = 'none';
    if (!map || !saved) return;
    L.DomEvent.off(map.getContainer(), 'pointerdown pointermove pointerup pointercancel', onPointer);
    map.off('terrainchange', onTerrain);
    map.options.scrollWheelZoom = saved.scrollWheelZoom;
    for (const name of saved.handlers) map[name].enable();
    map.setView(state.latlng, saved.zoom, { animate: false });
    map.setPitch(saved.pitch);
    saved = null;
  };
  L.DomEvent.on(button, 'click', () => (saved ? stop() : start()));
  let ready = false;
  layer.on('ready', () => { ready = true; if (layer._map) control.addTo(layer._map); });
  layer.on('add', () => { if (ready) control.addTo(layer._map); });
  layer.on('remove', () => { stop(); control.remove(); });
}

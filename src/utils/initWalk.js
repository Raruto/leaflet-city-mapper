import {
  controlOnAdd, onBlur, onKey, onLayerAdd, onLayerRemove, onPointer, onReady, onTerrain, start, step, stop, toggle
} from './walk.js';

/**
 * Third-person walk mode, toggled by a map button (and Esc): a pedestrian at the map centre runs with W/S (or ↑/↓) and
 * turns with A/D (or ←/→); the camera swings back behind it while it moves. Dragging the map only turns the camera
 * (bearing, pitch); the wheel changes the camera distance.
 * The walker follows the terrain, bridges included, and `layer.walker` exposes `{ latlng, heading, phase }`.
 * Source options: `speed` (m/s, default 6), `distance` (camera distance in metres, default 20), `position` (button corner, default 'topleft').
 * Visible meshes of the other 3D layers (buildings, trees, models, streetlights) are solid; terrain and traffic are not.
 */
export function initWalk(layer, {
  speed = 70,
  distance = 20,
  position = 'bottomright',
  ...options
} = {}) {
  layer._init3D(options);
  const keys = new Set();
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

  const context = {
    layer,
    speed,
    distance,
    keys,
    control,
    container,
    button,
    hint,
    meshes: null,
    frame: null,
    last: undefined,
    swing: 0,
    saved: null,
    drag: null,
    ready: false,
    state: layer.walker = { latlng: null, heading: 0, phase: 0 }
  }
  context.step = step.bind(context);
  context.onKey = onKey.bind(context);
  context.onBlur = onBlur.bind(context);
  context.onPointer = onPointer.bind(context);
  context.onTerrain = onTerrain.bind(context);
  context.start = start.bind(context);
  context.stop = stop.bind(context);
  context.toggle = toggle.bind(context);
  context.controlOnAdd = controlOnAdd.bind(context);
  context.onReady = onReady.bind(context);
  context.onLayerAdd = onLayerAdd.bind(context);
  context.onLayerRemove = onLayerRemove.bind(context);

  control.onAdd = context.controlOnAdd;
  L.DomEvent.on(button, 'click', context.toggle);
  layer.on('ready', context.onReady);
  layer.on('add', context.onLayerAdd);
  layer.on('remove', context.onLayerRemove);
};

import { init3D } from '../scene/init3D.js';
import {
  onBlur, onKey, onPointer, onTerrain, start, step, stop, toggle
} from './walk.js';

/**
 * Third-person walk mode, toggled by a map button (and Esc): a pedestrian at the map centre runs with W/S (or ↑/↓) and
 * turns with A/D (or ←/→); the camera swings back behind it while it moves. Dragging the map only turns the camera
 * (bearing, pitch); the wheel changes the camera distance.
 * The walker follows the terrain, bridges included, and `control.walker` exposes `{ latlng, heading, phase }`.
 * Options: `speed` (m/s, default 70), `distance` (camera distance in metres, default 20), `position` (button corner, default 'bottomright').
 * Visible meshes of the other 3D layers (buildings, trees, models, streetlights) are solid; terrain and traffic are not.
 */
L.Control.Walk = L.Control.extend({
  options: { position: 'bottomright', speed: 70, distance: 20 },

  initialize(options) {
    L.Util.setOptions(this, options);
    initWalk(this, this.options);
  },

  onAdd(map) {
    this._walk.layer.addTo(map);
    return this._walk.container;
  },

  onRemove() {
    this._walk.stop();
    this._walk.layer.remove();
  },
});

function initWalk(control, {
  speed,
  distance,
  ...options
} = {}) {
  const layer = new L.Layer();
  layer._type = 'walk';
  init3D(layer, options);
  const keys = new Set();
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
    container,
    button,
    hint,
    meshes: null,
    frame: null,
    last: undefined,
    swing: 0,
    saved: null,
    drag: null,
    state: control.walker = layer.walker = { latlng: null, heading: 0, phase: 0 }
  }
  context.step = step.bind(context);
  context.onKey = onKey.bind(context);
  context.onBlur = onBlur.bind(context);
  context.onPointer = onPointer.bind(context);
  context.onTerrain = onTerrain.bind(context);
  context.start = start.bind(context);
  context.stop = stop.bind(context);
  context.toggle = toggle.bind(context);
  control._walk = context;
  L.DomEvent.on(button, 'click', context.toggle);
};

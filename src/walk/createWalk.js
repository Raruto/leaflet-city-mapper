import { typeByLayer } from '../weakmaps/typeByLayer.js';
import { walkerByLayer } from '../weakmaps/walkerByLayer.js';
import { L } from '../globals/L.js';
import { init3D } from '../scene/init3D.js';
import { onBlur } from './onWalkBlur.js';
import { onKey } from './onWalkKey.js';
import { onPointer } from './onWalkPointer.js';
import { onTerrain } from './onWalkTerrain.js';
import { start } from './startWalking.js';
import { step } from './animateWalker.js';
import { stop } from './stopWalking.js';
import { toggle } from './toggleWalking.js';

/**
 * Create the walk layer, control UI and bound event handlers for a control.
 *
 * @param {L.Control} control Control receiving the walk state.
 * @param {Object} options Walking speed, camera distance and layer options.
 */
export function createWalk(control, {
  speed,
  distance,
  ...options
}) {
  const layer = /* alloc */ new L.Layer();
  typeByLayer.set(layer, 'walk');
  init3D(layer, options);
  const keys = /* alloc */ new Set();
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
  hint.textContent = 'W/S: run · A/D: turn · hold Space: ascend · drag: look around · Esc: exit';
  L.DomEvent.disableClickPropagation(container);

  const context = /* alloc */ {
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
    nextClearanceCheck: 0,
    swing: 0,
    verticalSpeed: 0,
    saved: null,
    hitData: null,
    local: null,
    state: control.walker = /* alloc */ { latlng: null, heading: 0, phase: 0, height: 0 }
  }
  walkerByLayer.set(layer, context.state);
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
}

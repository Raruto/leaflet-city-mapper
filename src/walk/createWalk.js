import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


import { init3D } from '../scene/init3D.js';
import { onBlur } from './onBlur.js';
import { onKey } from './onKey.js';
import { onPointer } from './onPointer.js';
import { onTerrain } from './onTerrain.js';
import { start } from './start.js';
import { step } from './step.js';
import { stop } from './stop.js';
import { toggle } from './toggle.js';

export function createWalk(control, {
  speed,
  distance,
  ...options
}) {
  const layer = /* allocation: required -- Each walk mode owns a native layer lifecycle. */ new L.Layer();
  sceneByLayer.get(layer)._type = 'walk';
  init3D(layer, options);
  const keys = /* allocation: required -- Keep pressed keys independent for each control. */ new Set();
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

  const context = /* allocation: required -- Each walk control owns its own active state. */ {
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
    hitData: /* allocation: required -- Each walker needs isolated reusable collision state. */ {
      x: 0, y: 0, z: 0, dx: 0, dz: 0, reach: 0, best: 0, found: false,
      seen: /* allocation: required -- Keep triangle de-duplication local to this walker. */ new Set(),
      normal: /* allocation: required -- Each walker retains its reusable nearest-wall normal. */ [0, 0],
    },
    local: /* allocation: required -- Keep reusable foot coordinates local to this walker. */ [0, 0, 0],
    state: control.walker = sceneByLayer.get(layer).walker = /* allocation: required -- Expose a distinct mutable walker position per control. */ { latlng: null, heading: 0, phase: 0 }
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
}

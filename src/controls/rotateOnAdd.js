import { L } from '../globals/L.js';
import { cameraDragSensitivity } from '../globals/cameraDragSensitivity.js';
import { cameraBearingSensitivity } from '../globals/cameraBearingSensitivity.js';
import { rotateButtonClick } from './rotateButtonClick.js';
import { rotateButtonKeydown } from './rotateButtonKeydown.js';
import { refreshRotateControl } from './refreshRotateControl.js';
import { dragCamera } from './dragCamera.js';
import { acceptRotateDrag } from './acceptRotateDrag.js';
import { refreshRotateFocus } from './refreshRotateFocus.js';


export function rotateOnAdd(map) {
  const container = L.DomUtil.create('div', 'leaflet-control-rotate leaflet-bar');
  const button = L.DomUtil.create('a', 'leaflet-control-rotate-toggle', container);
  this._map = map;
  this._container = container;
  this._button = button;
  button._rotateControl = this;
  button.href = '#';
  button.draggable = false;
  button.setAttribute('role', 'button');
  button.title = this.options.visualizePitch ? 'Reset bearing and pitch' : 'Reset bearing to north';
  button.setAttribute('aria-label', button.title);
  button.style.cssText = 'cursor:grab;touch-action:none';
  const arrow = L.DomUtil.create('span', 'leaflet-control-rotate-arrow', button);
  this._arrow = arrow;
  arrow.setAttribute('aria-hidden', 'true');
  arrow.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;background: no-repeat center / 29px 29px';
  arrow.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 29 29%27%3E%3Cpath fill=%27%23333%27 d=%27M10.5 14 14.5 6 18.5 14Z%27/%3E%3Cpath fill=%27%23ccc%27 d=%27M10.5 16 14.5 24 18.5 16Z%27/%3E%3C/svg%3E")';
  button.onclick = rotateButtonClick;
  button.onkeydown = rotateButtonKeydown;
  this._refresh = refreshRotateControl;
  map.on('rotate pitch', this._refresh, this);
  this._refresh();
  this._dragState = dragCamera(map, button, acceptRotateDrag,
    this.options.visualizePitch ? cameraDragSensitivity : cameraBearingSensitivity);
  button.addEventListener('focusout', refreshRotateFocus);
  L.DomEvent.on(button, 'dblclick contextmenu', L.DomEvent.stop);
  L.DomEvent.disableClickPropagation(container);
  L.DomEvent.disableScrollPropagation(container);
  return container;
}

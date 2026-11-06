import { radians } from '../globals/radians.js';
import { earthCirc } from '../globals/earthCirc.js';
import { L } from '../globals/L.js';
import { sceneWalkHandlers } from '../globals/sceneWalkHandlers.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';
import { mapSetPitch } from '../camera/mapSetPitch.js';
import { step } from './animateWalker.js';
import { onKey } from './onWalkKey.js';
import { onBlur } from './onWalkBlur.js';
import { onPointer } from './onWalkPointer.js';
import { onTerrain } from './onWalkTerrain.js';


export function start() {
  const map = this.layer._map;
  if (this.saved || !map) return;
  this.state.latlng = map.getCenter();
  this.state.height = this.verticalSpeed = 0;
  // Zoom whose camera distance (1.5 viewport heights, as in scene/render.js) is about `distance` metres behind the walker.
  const pixelsPerMetre = map.getSize().y * 1.5 / this.distance;
  const zoom = Math.min(map.getMaxZoom(), Math.log2(pixelsPerMetre * earthCirc * Math.cos(this.state.latlng.lat * radians) / 256));
  let name;
  this.saved = /* alloc */ {
    zoom: map.getZoom(), pitch: mapGetPitch(map), scrollWheelZoom: map.options.scrollWheelZoom,
    handlers: /* alloc */ [],
  };
  for (name of sceneWalkHandlers) {
    if (map[name]?.enabled()) this.saved.handlers.push(name);
  }
  for (name of this.saved.handlers) map[name].disable();
  // Wheel zoom moves the camera closer or farther, keeping the walker centred.
  map.options.scrollWheelZoom = this.saved.scrollWheelZoom && 'center';
  this.state.heading = -mapGetBearing(map) * radians;
  map.setView(this.state.latlng, zoom, /* alloc */ { animate: false });
  mapSetPitch(map, 75);
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

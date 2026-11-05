import { step } from './step.js';
import { onKey } from './onKey.js';
import { onBlur } from './onBlur.js';
import { onPointer } from './onPointer.js';
import { onTerrain } from './onTerrain.js';

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

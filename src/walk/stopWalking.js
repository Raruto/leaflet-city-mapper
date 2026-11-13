import { L } from '../globals/L.js';
import { mapSetPitch } from '../camera/mapSetPitch.js';
import * as disposeMesh from '../rendering/disposeMesh.js';
import { onKey } from './onWalkKey.js';
import { onBlur } from './onWalkBlur.js';
import { onPointer } from './onWalkPointer.js';
import { onTerrain } from './onWalkTerrain.js';

/** Leave walk mode, release walker meshes and listeners, and restore the saved map settings. */
export function stop() {
  const map = this.layer._map;
  cancelAnimationFrame(this.frame);
  this.keys.clear(); this.dragging = false;
  this.state.height = this.verticalSpeed = 0;
  L.DomEvent.off(document, 'keydown keyup', this.onKey);
  L.DomEvent.off(window, 'blur', this.onBlur);
  let mesh, name;
  if (this.meshes) for (mesh of this.meshes) disposeMesh.disposeMesh(this.layer, mesh);
  this.meshes = null;
  this.button.setAttribute('aria-pressed', 'false');
  this.button.style.background = '#fff';
  this.hint.style.display = 'none';
  if (!map || !this.saved) return;
  L.DomEvent.off(map.getContainer(), 'pointerdown pointermove pointerup pointercancel', this.onPointer);
  map.off('terrainchange', this.onTerrain);
  map.options.scrollWheelZoom = this.saved.scrollWheelZoom;
  for (name of this.saved.handlers) map[name].enable();
  map.setView(this.state.latlng, this.saved.zoom, /* alloc */ { animate: false });
  mapSetPitch(map, this.saved.pitch);
  this.saved = null;
}

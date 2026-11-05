import * as disposeMesh from '../rendering/meshes/disposeMesh.js';
import { onKey } from './onKey.js';
import { onBlur } from './onBlur.js';
import { onPointer } from './onPointer.js';
import { onTerrain } from './onTerrain.js';

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

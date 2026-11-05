import { cityMapper } from '../constants/cityMapper.js';
import * as destroyTexture from '../rendering/destroyTexture.js';
import * as endZoom from './endZoom.js';
import * as onMapChange from './onMapChange.js';
import * as onPointerLeave from './onPointerLeave.js';
import * as onZoomAnim from './onZoomAnim.js';
import { releaseArea } from './releaseArea.js';
import { updateStatus } from './updateStatus.js';
import { setParent } from './setParent.js';
import * as startZoom from './startZoom.js';
import { cancelUpdate } from './cancelUpdate.js';
import { update } from './update.js';
import { releaseRenderer } from './releaseRenderer.js';

/** Release source meshes/UI; retain manually added objects and model CPU data. */
export function onRemove3DLayer(backend, map) {
  backend._added = Promise.withResolvers();
  if (backend.container) {
    onPointerLeave.onPointerLeave(backend);
    L.DomEvent.off(backend.container, backend._pointerEvents, backend);
    backend.container = null;
  }
  for (const area of backend._areas.values()) releaseArea(backend, area);
  backend._areas.clear();
  backend._tooltip?.remove();
  backend._tooltip = null;
  if (backend.url || backend._geojson) updateStatus(backend, false);
  const shared = backend._shared;
  if (!shared) return;
  setParent(backend.root, null);
  shared._layers.delete(backend);
  if (shared === backend) {
    map.off('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange.onMapChange, backend);
    map.off('zoomstart', startZoom.startZoom, backend);
    map.off('zoomanim', onZoomAnim.onZoomAnim, backend);
    map.off('zoomend', endZoom.endZoom, backend);
    cancelUpdate(backend);
    if (backend._layers.size) {
      // Keep the original scene origin and GPU resources when ownership changes.
      const next = backend._layers.values().next().value;
      for (const key of ['_layers', '_sceneOrigin', '_size', '_zoomLevel', '_zoomTransitions', '_zoomView', '_cursor', '_roofRaster']) {
        next[key] = backend[key];
        delete backend[key];
      }
      for (const layer of next._layers) layer._shared = next;
      cityMapper.renderers.set(map, next);
      map.on('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange.onMapChange, next);
      map.on('zoomstart', startZoom.startZoom, next);
      map.on('zoomanim', onZoomAnim.onZoomAnim, next);
      map.on('zoomend', endZoom.endZoom, next);
      update(next);
    } else {
      if (backend._roofRaster) destroyTexture.destroyTexture(backend, backend._roofRaster.texture.texture);
      backend._roofRaster = null;
      for (const animation of backend._zoomTransitions?.keys() || []) animation.play();
      backend._zoomTransitions = null;
      backend._zoomView = null;
      delete map._cameraView;
      map.getContainer().classList.remove('leaflet-camera-zoom');
      const renderer = backend.renderer;
      renderer.canvas.remove();
      releaseRenderer(renderer, backend);
      cityMapper.renderers.delete(map);
      for (const key of ['_layers', '_sceneOrigin', '_size', '_zoomLevel', '_cursor']) delete backend[key];
    }
  } else update(shared);
  backend._shared = backend.renderer = backend.scene = backend.camera = null;
}

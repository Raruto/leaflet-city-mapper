import { sceneByLayer } from '../globals/sceneByLayer.js';
import { sceneTransferFields } from '../globals/sceneTransferFields.js';
import { renderers } from '../globals/renderers.js';
import { cameraByMap } from '../globals/cameraByMap.js';
import { sceneCleanupFields } from '../globals/sceneCleanupFields.js';



import * as destroyTexture from '../rendering/destroyTexture.js';
import * as endZoom from './endZoom.js';
import * as onMapChange from './onMapChange.js';
import * as onPointerLeave from '../picking/onPointerLeave.js';
import * as onZoomAnim from './onZoomAnim.js';
import { releaseArea } from '../sources/releaseArea.js';
import { updateStatus } from '../sources/updateStatus.js';
import { setParent } from './setParent.js';
import * as startZoom from './startZoom.js';
import { cancelUpdate } from './cancelUpdate.js';
import { update } from './update.js';
import { releaseRenderer } from './releaseRenderer.js';

/** Release source meshes/UI; retain manually added objects and model CPU data. */
export function onRemove3DLayer(backend, map) {
  sceneByLayer.get(backend)._added = Promise.withResolvers();
  if (sceneByLayer.get(backend).container) {
    onPointerLeave.onPointerLeave(backend);
    L.DomEvent.off(sceneByLayer.get(backend).container, sceneByLayer.get(backend)._pointerEvents, backend);
    sceneByLayer.get(backend).container = null;
  }
  let area, key, layer, animation;
  for (area of sceneByLayer.get(backend)._areas.values()) releaseArea(backend, area);
  sceneByLayer.get(backend)._areas.clear();
  sceneByLayer.get(backend)._tooltip?.remove();
  sceneByLayer.get(backend)._tooltip = null;
  if (sceneByLayer.get(backend).url || sceneByLayer.get(backend)._geojson) updateStatus(backend, false);
  const shared = sceneByLayer.get(backend)._shared;
  if (!shared) return;
  setParent(sceneByLayer.get(backend).root, null);
  sceneByLayer.get(shared)._layers.delete(backend);
  if (shared === backend) {
    map.off('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange.onMapChange, backend);
    map.off('zoomstart', startZoom.startZoom, backend);
    map.off('zoomanim', onZoomAnim.onZoomAnim, backend);
    map.off('zoomend', endZoom.endZoom, backend);
    cancelUpdate(backend);
    if (sceneByLayer.get(backend)._layers.size) {
      // Keep the original scene origin and GPU resources when ownership changes.
      const next = sceneByLayer.get(backend)._layers.values().next().value;
      for (key of sceneTransferFields) {
        sceneByLayer.get(next)[key] = sceneByLayer.get(backend)[key];
        delete sceneByLayer.get(backend)[key];
      }
      for (layer of sceneByLayer.get(next)._layers) sceneByLayer.get(layer)._shared = next;
      renderers.set(map, next);
      map.on('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange.onMapChange, next);
      map.on('zoomstart', startZoom.startZoom, next);
      map.on('zoomanim', onZoomAnim.onZoomAnim, next);
      map.on('zoomend', endZoom.endZoom, next);
      update(next);
    } else {
      if (sceneByLayer.get(backend)._roofRaster) destroyTexture.destroyTexture(backend, sceneByLayer.get(backend)._roofRaster.texture.texture);
      sceneByLayer.get(backend)._roofRaster = null;
      if (sceneByLayer.get(backend)._zoomTransitions) {
        for (animation of sceneByLayer.get(backend)._zoomTransitions.keys()) animation.play();
      }
      sceneByLayer.get(backend)._zoomTransitions = null;
      sceneByLayer.get(backend)._zoomView = null;
      delete cameraByMap.get(map)._cameraView;
      map.getContainer().classList.remove('leaflet-camera-zoom');
      const renderer = sceneByLayer.get(backend).renderer;
      renderer.canvas.remove();
      releaseRenderer(renderer, backend);
      renderers.delete(map);
      for (key of sceneCleanupFields) delete sceneByLayer.get(backend)[key];
    }
  } else update(shared);
  sceneByLayer.get(backend)._shared = sceneByLayer.get(backend).renderer = sceneByLayer.get(backend).scene = sceneByLayer.get(backend).camera = null;
}

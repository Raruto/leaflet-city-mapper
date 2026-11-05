import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

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
  pluginState(backend)._added = Promise.withResolvers();
  if (pluginState(backend).container) {
    onPointerLeave.onPointerLeave(backend);
    L.DomEvent.off(pluginState(backend).container, pluginState(backend)._pointerEvents, backend);
    pluginState(backend).container = null;
  }
  let area, key, layer, animation;
  for (area of pluginState(backend)._areas.values()) releaseArea(backend, area);
  pluginState(backend)._areas.clear();
  pluginState(backend)._tooltip?.remove();
  pluginState(backend)._tooltip = null;
  if (pluginState(backend).url || pluginState(backend)._geojson) updateStatus(backend, false);
  const shared = pluginState(backend)._shared;
  if (!shared) return;
  setParent(pluginState(backend).root, null);
  pluginState(shared)._layers.delete(backend);
  if (shared === backend) {
    map.off('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange.onMapChange, backend);
    map.off('zoomstart', startZoom.startZoom, backend);
    map.off('zoomanim', onZoomAnim.onZoomAnim, backend);
    map.off('zoomend', endZoom.endZoom, backend);
    cancelUpdate(backend);
    if (pluginState(backend)._layers.size) {
      // Keep the original scene origin and GPU resources when ownership changes.
      const next = pluginState(backend)._layers.values().next().value;
      for (key of sharedState.allocationSceneTransferFields) {
        pluginState(next)[key] = pluginState(backend)[key];
        delete pluginState(backend)[key];
      }
      for (layer of pluginState(next)._layers) pluginState(layer)._shared = next;
      sharedState.renderers.set(map, next);
      map.on('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange.onMapChange, next);
      map.on('zoomstart', startZoom.startZoom, next);
      map.on('zoomanim', onZoomAnim.onZoomAnim, next);
      map.on('zoomend', endZoom.endZoom, next);
      update(next);
    } else {
      if (pluginState(backend)._roofRaster) destroyTexture.destroyTexture(backend, pluginState(backend)._roofRaster.texture.texture);
      pluginState(backend)._roofRaster = null;
      if (pluginState(backend)._zoomTransitions) {
        for (animation of pluginState(backend)._zoomTransitions.keys()) animation.play();
      }
      pluginState(backend)._zoomTransitions = null;
      pluginState(backend)._zoomView = null;
      delete pluginState(map)._cameraView;
      map.getContainer().classList.remove('leaflet-camera-zoom');
      const renderer = pluginState(backend).renderer;
      renderer.canvas.remove();
      releaseRenderer(renderer, backend);
      sharedState.renderers.delete(map);
      for (key of sharedState.allocationSceneCleanupFields) delete pluginState(backend)[key];
    }
  } else update(shared);
  pluginState(backend)._shared = pluginState(backend).renderer = pluginState(backend).scene = pluginState(backend).camera = null;
}

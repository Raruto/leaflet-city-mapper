import { addedByLayer } from '../weakmaps/addedByLayer.js';
import { areasByLayer } from '../weakmaps/areasByLayer.js';
import { cameraByLayer } from '../weakmaps/cameraByLayer.js';
import { containerByLayer } from '../weakmaps/containerByLayer.js';
import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { layersByLayer } from '../weakmaps/layersByLayer.js';
import { pointerEventsByLayer } from '../weakmaps/pointerEventsByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { sceneByLayer } from '../weakmaps/sceneByLayer.js';
import { sceneFields } from '../weakmaps/sceneFields.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { tooltipByLayer } from '../weakmaps/tooltipByLayer.js';
import { urlByLayer } from '../weakmaps/urlByLayer.js';

import { L } from '../globals/L.js';
import { sceneTransferFields } from '../globals/sceneTransferFields.js';
import { renderers } from '../weakmaps/renderers.js';



import * as endZoom from '../animations/endZoom.js';
import * as onMapChange from './onMapChange.js';
import * as onPointerLeave from '../picking/onPointerLeave.js';
import * as onZoomAnim from '../animations/onZoomAnim.js';
import { releaseArea } from '../sources/releaseArea.js';
import { updateStatus } from '../sources/updateSourceStatus.js';
import { setParent } from './setParent.js';
import * as startZoom from '../animations/startZoom.js';
import { cancelUpdate } from './cancelUpdate.js';
import { update } from './scheduleSceneUpdate.js';
import { releaseSharedScene } from './releaseSharedScene.js';

/** Release source meshes/UI; retain manually added objects and model CPU data. */
export function onRemove3DLayer(layer, map) {
  addedByLayer.set(layer, Promise.withResolvers());
  if (containerByLayer.get(layer)) {
    onPointerLeave.onPointerLeave(layer);
    L.DomEvent.off(containerByLayer.get(layer), pointerEventsByLayer.get(layer), layer);
    containerByLayer.set(layer, null);
  }
  let area, key, sceneLayer, field;
  for (area of areasByLayer.get(layer).values()) releaseArea(layer, area);
  areasByLayer.get(layer).clear();
  tooltipByLayer.get(layer)?.remove();
  tooltipByLayer.set(layer, null);
  if (urlByLayer.get(layer) || geojsonByLayer.get(layer)) updateStatus(layer, false);
  const shared = sharedByLayer.get(layer);
  if (!shared) return;
  setParent(rootByLayer.get(layer), null);
  layersByLayer.get(shared).delete(layer);
  if (shared === layer) {
    map.off('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange.onMapChange, layer);
    map.off('zoomstart', startZoom.startZoom, layer);
    map.off('zoomanim', onZoomAnim.onZoomAnim, layer);
    map.off('zoomend', endZoom.endZoom, layer);
    cancelUpdate(layer);
    if (layersByLayer.get(layer).size) {
      // Keep the original scene origin and GPU resources when ownership changes.
      const next = layersByLayer.get(layer).values().next().value;
      for (key of sceneTransferFields) {
        field = sceneFields[key];
        field.set(next, field.get(layer));
        field.delete(layer);
      }
      for (sceneLayer of layersByLayer.get(next)) sharedByLayer.set(sceneLayer, next);
      renderers.set(map, next);
      map.on('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange.onMapChange, next);
      map.on('zoomstart', startZoom.startZoom, next);
      map.on('zoomanim', onZoomAnim.onZoomAnim, next);
      map.on('zoomend', endZoom.endZoom, next);
      update(next);
    } else {
      releaseSharedScene(layer, map);
    }
  } else update(shared);
  sharedByLayer.set(layer, null);
  rendererByLayer.set(layer, null);
  sceneByLayer.set(layer, null);
  cameraByLayer.set(layer, null);
}

import { cameraByLayer } from '../weakmaps/cameraByLayer.js';
import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { headerByLayer } from '../weakmaps/headerByLayer.js';
import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { layersByLayer } from '../weakmaps/layersByLayer.js';
import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { rendererReadyByLayer } from '../weakmaps/rendererReadyByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { sceneByLayer } from '../weakmaps/sceneByLayer.js';
import { sceneOriginByLayer } from '../weakmaps/sceneOriginByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { terrainBaseYByLayer } from '../weakmaps/terrainBaseYByLayer.js';

import { radians } from '../globals/radians.js';
import { renderers } from '../weakmaps/renderers.js';
import { setParent } from './setParent.js';
import { render } from '../rendering/render.js';
import { update } from './scheduleSceneUpdate.js';
import { updateArea } from '../sources/updateArea.js';
import { setTerrainHeight } from '../terrain/setTerrainHeight.js';
import { noOperation } from '../utils/noOperation.js';
import { restoreObject } from './restoreObject.js';
import { traverse } from './traverse.js';
import { initializeSharedRenderer } from '../gpu/initializeSharedRenderer.js';

/**
 * Join/create this map's shared scene and rebuild GPU objects if its context changed.
 * Buffer/program handles belong to one context; typed arrays and decoded images do not.
 * @private
 */
export async function attach(layer, map) {
  let shared = renderers.get(map);

  if (rendererReadyByLayer.get(shared)) {
    await rendererReadyByLayer.get(shared).promise;
  }
  if (!shared) {
    shared = layer;
    rendererReadyByLayer.set(layer, Promise.withResolvers());
    rendererReadyByLayer.get(layer).promise.catch(noOperation);
    renderers.set(map, shared);
    await initializeSharedRenderer(layer, map);
    rendererReadyByLayer.get(layer).resolve();
    rendererReadyByLayer.delete(shared);
    render(shared);
    renderers.set(map, shared);
  }

  const origin = map.options.crs.project(sceneOriginByLayer.get(shared));
  const point = map.options.crs.project(locationByLayer.get(layer));
  const metres = Math.cos(sceneOriginByLayer.get(shared).lat * radians);
  if (terrainBaseYByLayer.get(layer) == null) terrainBaseYByLayer.set(layer, rootByLayer.get(layer).position[1]);
  rootByLayer.get(layer).position[0] = (point.x - origin.x) * metres;
  rootByLayer.get(layer).position[1] = terrainBaseYByLayer.get(layer);
  rootByLayer.get(layer).position[2] = -(point.y - origin.y) * metres;
  setTerrainHeight(layer);
  // Each group's metres are measured at its own latitude, not the shared camera origin.
  rootByLayer.get(layer).scale.fill(metres / Math.cos(locationByLayer.get(layer).lat * radians));
  sharedByLayer.set(layer, shared);
  rendererByLayer.set(layer, rendererByLayer.get(shared));
  sceneByLayer.set(layer, sceneByLayer.get(shared));
  cameraByLayer.set(layer, cameraByLayer.get(shared));
  layersByLayer.get(shared).add(layer);
  setParent(rootByLayer.get(layer), sceneByLayer.get(shared));
  traverse(rootByLayer.get(layer), restoreObject, layer);
  update(shared);
  if ((headerByLayer.get(layer) && kindByLayer.get(layer) !== 'raster') || geojsonByLayer.get(layer)) updateArea(layer);
}

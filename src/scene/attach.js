import { radians } from '../globals/radians.js';
import { renderers } from '../globals/renderers.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { setParent } from './setParent.js';
import { render } from '../rendering/render.js';
import { update } from './update.js';
import { updateArea } from '../sources/updateArea.js';
import { setTerrainHeight } from '../terrain/setTerrainHeight.js';
import { noOperation } from '../utils/noOperation.js';
import { restoreObject } from './restoreObject.js';
import { traverse } from './traverse.js';
import { initializeSharedRenderer } from './initializeSharedRenderer.js';

/**
 * Join/create this map's shared scene and rebuild GPU objects if its context changed.
 * Buffer/program handles belong to one context; typed arrays and decoded images do not.
 * @private
 */
export async function attach(backend, map) {
  let shared = renderers.get(map);
  if (sceneByLayer.get(shared)?._rendererReady) {
    await sceneByLayer.get(shared)._rendererReady.promise;
  }
  if (!shared) {
    shared = backend;
    sceneByLayer.get(backend)._rendererReady = Promise.withResolvers();
    sceneByLayer.get(backend)._rendererReady.promise.catch(noOperation);
    renderers.set(map, shared);
    await initializeSharedRenderer(backend, map);
    sceneByLayer.get(backend)._rendererReady.resolve();
    delete sceneByLayer.get(shared)._rendererReady;
    render(shared);
    renderers.set(map, shared);
  }
  const origin = map.options.crs.project(sceneByLayer.get(shared)._sceneOrigin);
  const point = map.options.crs.project(sceneByLayer.get(backend).location);
  const metres = Math.cos(sceneByLayer.get(shared)._sceneOrigin.lat * radians);
  sceneByLayer.get(backend)._terrainBaseY ??= sceneByLayer.get(backend).root.position[1];
  sceneByLayer.get(backend).root.position[0] = (point.x - origin.x) * metres;
  sceneByLayer.get(backend).root.position[1] = sceneByLayer.get(backend)._terrainBaseY;
  sceneByLayer.get(backend).root.position[2] = -(point.y - origin.y) * metres;
  setTerrainHeight(backend);
  // Each group's metres are measured at its own latitude, not the shared camera origin.
  sceneByLayer.get(backend).root.scale.fill(metres / Math.cos(sceneByLayer.get(backend).location.lat * radians));
  sceneByLayer.get(backend)._shared = shared;
  sceneByLayer.get(backend).renderer = sceneByLayer.get(shared).renderer;
  sceneByLayer.get(backend).scene = sceneByLayer.get(shared).scene;
  sceneByLayer.get(backend).camera = sceneByLayer.get(shared).camera;
  sceneByLayer.get(shared)._layers.add(backend);
  setParent(sceneByLayer.get(backend).root, sceneByLayer.get(shared).scene);
  traverse(sceneByLayer.get(backend).root, restoreObject, backend);
  update(shared);
  if ((sceneByLayer.get(backend).header && sceneByLayer.get(backend).kind !== 'raster') || sceneByLayer.get(backend)._geojson) updateArea(backend);
}

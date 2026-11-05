import { sceneByLayer } from '../globals/sceneByLayer.js';
import { cameraByMap } from '../globals/cameraByMap.js';


import { buildAreaFeature } from './buildAreaFeature.js';
import { attachAreaMesh } from './attachAreaMesh.js';
import { loadSource } from '../archives/loadSource.js';
import { sourceAreaContext } from './sourceAreaContext.js';
import { pump } from './pump.js';

export async function buildArea(backend, area, map) {
  let feature;
  try {
    await /* alloc */ new Promise(requestAnimationFrame);
    await sceneByLayer.get(cameraByMap.get(map)._terrain3D)?._terrainPromise;
    if (area.request.signal.aborted) return;
    const data = await loadSource(backend, area);
    if (area.request.signal.aborted) return;
    if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
      throw /* alloc */ new Error('Invalid GeoJSON response');
    }
    if (sceneByLayer.get(backend)._geojson && typeof backend.options.style !== 'function') {
      throw /* alloc */ new Error('style must be a function');
    }
    const context = sourceAreaContext(backend, area, map);
    let deadline = performance.now() + 4;
    for (feature of data.features) {
      if (area.request.signal.aborted) return;
      if (performance.now() >= deadline) {
        await /* alloc */ new Promise(requestAnimationFrame);
        if (area.request.signal.aborted) return;
        deadline = performance.now() + 4;
      }
      buildAreaFeature(context, feature);
    }
    attachAreaMesh(context);
  } catch (error) {
    if (!area.request.signal.aborted) {
      area.error = error.message;
      backend.fire('error', /* alloc */ { error });
    }
  } finally {
    sceneByLayer.get(backend)._inflight--;
    pump(backend, map);
  }
}

import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { inflightByLayer } from '../weakmaps/inflightByLayer.js';
import { cameraViewByMap } from '../weakmaps/cameraViewByMap.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';


import { buildAreaFeature } from './buildAreaFeature.js';
import { attachAreaMesh } from './attachAreaMesh.js';
import { loadSource } from '../archives/loadSource.js';
import { sourceAreaContext } from './sourceAreaContext.js';
import { pump } from './pump.js';

export async function buildArea(layer, area, map) {
  let feature;
  try {
    await /* alloc */ new Promise(requestAnimationFrame);
    await cameraViewByMap.get(map);
    if (area.request.signal.aborted) return;
    const data = await loadSource(layer, area);
    if (area.request.signal.aborted) return;
    if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
      throw /* alloc */ new Error('Invalid GeoJSON response');
    }
    if (geojsonByLayer.get(layer) && typeof layer.options.style !== 'function') {
      throw /* alloc */ new Error('style must be a function');
    }
    const context = sourceAreaContext(layer, area, map);
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
      layer.fire('error', /* alloc */ { error });
    }
  } finally {
    mutateWeakMap(inflightByLayer, layer, "--", undefined, false);
    pump(layer, map);
  }
}

import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { inflightByLayer } from '../weakmaps/inflightByLayer.js';
import { cameraViewByMap } from '../weakmaps/cameraViewByMap.js';


import { attachAreaMesh } from './attachAreaMesh.js';
import { loadSource } from '../archives/loadSource.js';
import { sourceAreaContext } from './sourceAreaContext.js';
import { pump } from './pumpSourceAreas.js';
import { buildAreaInWorker } from '../workers/buildAreaInWorker.js';
import { buildAreaFeatures } from './buildAreaFeatures.js';

export async function buildArea(layer, area, map) {
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
    // ponytail: feature-count cutoff avoids startup overhead; count vertices if giant single polygons matter.
    if (layer.options.worker !== false && typeof Worker !== 'undefined' && data.features.length >= 64) {
      context.jobs = /* alloc */ [];
    }
    await buildAreaFeatures(context, area, data.features);
    if (area.request.signal.aborted) return;
    if (context.jobs) await buildAreaInWorker(context, area.request.signal);
    if (area.request.signal.aborted) return;
    attachAreaMesh(context);
  } catch (error) {
    if (!area.request.signal.aborted) {
      area.error = error.message;
      layer.fire('error', /* alloc */ { error });
    }
  } finally {
    inflightByLayer.set(layer, inflightByLayer.get(layer) - 1);
    pump(layer, map);
  }
}

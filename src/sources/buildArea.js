import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { inflightByLayer } from '../weakmaps/inflightByLayer.js';
import { cameraViewByMap } from '../weakmaps/cameraViewByMap.js';
import { attachAreaMesh } from './attachAreaMesh.js';
import { loadSource } from '../archives/loadSource.js';
import { sourceAreaContext } from './sourceAreaContext.js';
import { pump } from './pumpSourceAreas.js';
import { buildAreaInWorker } from '../workers/buildAreaInWorker.js';
import { buildAreaFeatures } from './buildAreaFeatures.js';

/**
 * Load and build an area with worker geometry, reporting errors and releasing its load slot.
 *
 * @param {L.Layer} layer Source layer.
 * @param {Object} area Area state and abort controller.
 * @param {L.Map} map Map containing the layer.
 *
 * @returns {Promise<void>} Completion of the build attempt.
 *
 * @throws {Error} Internally if the response is not a GeoJSON feature collection; reported to the layer.
 * @throws {Error} Internally if the GeoJSON style is not a function; reported to the layer.
 * @throws {Error} Internally if workers are disabled; reported to the layer.
 */
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
    if (layer.options.worker === false) {
      throw /* alloc */ new Error('worker: false is no longer supported; GeoJSON geometry requires Web Workers');
    }
    const context = sourceAreaContext(layer, area, map);
    await buildAreaFeatures(context, area, data.features);
    if (area.request.signal.aborted) return;
    await buildAreaInWorker(context, area.request.signal);
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

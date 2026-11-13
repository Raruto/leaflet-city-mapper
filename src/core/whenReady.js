import { readyByLayer } from '../weakmaps/readyByLayer.js';
import { cameraReadyByMap } from '../weakmaps/cameraReadyByMap.js';

/**
 * Get a layer or map's readiness promise, or resolve immediately if none is registered.
 *
 * @param {L.Layer|L.Map} instance Layer or map to inspect.
 *
 * @returns {Promise} Readiness promise.
 */
export function ready(instance) {
  return readyByLayer.get(instance) ||
    cameraReadyByMap.get(instance) || Promise.resolve(instance);
}

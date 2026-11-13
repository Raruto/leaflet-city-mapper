import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { readyByLayer } from '../weakmaps/readyByLayer.js';
import { reportError } from './reportLayerError.js';

/**
 * Initialize a queued layer and reattach it to its map if necessary.
 *
 * @param {Object} task Queued initialization, settings and readiness state.
 *
 * @returns {L.Layer|Promise} Initialized layer or its readiness promise.
 *
 * @throws {Error} If initialization or reattachment fails.
 */
export function initializeLayer(task) {
  const { layer, ready } = task;
  if (task.error) {
    reportError(layer, task.error);
    return Promise.reject(task.error);
  }
  try {
    const map = layer._map;
    map?.removeLayer(layer);
    kindByLayer.delete(layer);
    task.initialize(layer, task.settings);
    map?.addLayer(layer);
    return readyByLayer.get(layer) === ready ? layer : readyByLayer.get(layer);
  } catch (error) {
    layer.fire('error', /* alloc */ { error });
    throw error;
  }
}

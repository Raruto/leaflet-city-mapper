import { failAttachment } from '../scene/failAttachment.js';

/**
 * Request a WebGPU adapter and fail the layer attachment if it is unavailable.
 *
 * @param {L.Layer} layer Layer being attached.
 * @param {L.Map} map Map receiving the layer.
 *
 * @returns {Promise<GPUAdapter>} The acquired adapter.
 */
export async function requestAdapter(layer, map) {
  let adapter;
  try {
    adapter = await navigator.gpu.requestAdapter();
  } catch (error) {
    failAttachment(error, layer, map);
  }
  if (!adapter) failAttachment(/* alloc */ new Error('Unable to acquire a WebGPU adapter'), layer, map);
  return adapter;
}

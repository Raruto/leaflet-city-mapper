import { failAttachment } from '../scene/failAttachment.js';

/**
 * Request a device from an adapter and fail the layer attachment on rejection.
 *
 * @param {GPUAdapter} adapter Adapter providing the device.
 * @param {L.Layer} layer Layer being attached.
 * @param {L.Map} map Map receiving the layer.
 *
 * @returns {Promise<GPUDevice>} The acquired device.
 */
export async function requestDevice(adapter, layer, map) {
  try {
    return await adapter.requestDevice();
  } catch (error) {
    failAttachment(error, layer, map);
  }
}

import { failAttachment } from './failAttachment.js';

export async function requestDevice(adapter, layer, map) {
  try {
    return await adapter.requestDevice();
  } catch (error) {
    failAttachment(error, layer, map);
  }
}

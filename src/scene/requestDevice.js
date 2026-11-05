import { failAttachment } from './failAttachment.js';

export async function requestDevice(adapter, backend, map) {
  try {
    return await adapter.requestDevice();
  } catch (error) {
    failAttachment(error, backend, map);
  }
}

import { failAttachment } from './failAttachment.js';

export async function requestAdapter(backend, map) {
  let adapter;
  try {
    adapter = await navigator.gpu.requestAdapter();
  } catch (error) {
    failAttachment(error, backend, map);
  }
  if (!adapter) failAttachment(/* allocation: required -- Preserve the failure stack for an unavailable adapter. */ new Error('Unable to acquire a WebGPU adapter'), backend, map);
  return adapter;
}

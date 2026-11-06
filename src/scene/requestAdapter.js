import { failAttachment } from './failAttachment.js';

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

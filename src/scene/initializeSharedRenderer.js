import { cameraByLayer } from '../weakmaps/cameraByLayer.js';
import { layersByLayer } from '../weakmaps/layersByLayer.js';
import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { sceneByLayer } from '../weakmaps/sceneByLayer.js';
import { sceneOriginByLayer } from '../weakmaps/sceneOriginByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { rendererDevices } from '../weakmaps/rendererDevices.js';
import { emptyNode } from './emptyNode.js';
import { failAttachment } from './failAttachment.js';
import { requestAdapter } from './requestAdapter.js';
import { requestDevice } from './requestDevice.js';
import { rendererDeviceError } from './rendererDeviceError.js';
import { rendererDeviceLost } from './rendererDeviceLost.js';
import { createSceneCamera } from './createSceneCamera.js';
import { initializeRendererResources } from './initializeRendererResources.js';
import { mountRenderer } from './mountRenderer.js';

export async function initializeSharedRenderer(layer, map) {
  const canvas = document.createElement('canvas');
  if (!navigator.gpu) {
    failAttachment(/* alloc */ new Error('Layer3D requires WebGPU'), layer, map);
  }
  const adapter = await requestAdapter(layer, map);
  const device = await requestDevice(adapter, layer, map);
  rendererDevices.set(device, map);
  device.addEventListener('uncapturederror', rendererDeviceError);
  Promise.all(/* alloc */ [device.lost, Promise.resolve(device)]).then(rendererDeviceLost);
  const context = canvas.getContext('webgpu');
  if (!context) {
    device.destroy();
    failAttachment(/* alloc */ new Error('Unable to create a WebGPU canvas context'), layer, map);
  }
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure(/* alloc */ { device, format, alphaMode: 'premultiplied' });
  map.getContainer().querySelector('.leaflet-webgpu-warning')?.remove();
  mutateWeakMap(sharedByLayer, layer, "=", layer);
  mutateWeakMap(layersByLayer, layer, "=", /* alloc */ new Set());
  mutateWeakMap(sceneOriginByLayer, layer, "=", locationByLayer.get(layer));
  mutateWeakMap(sceneByLayer, layer, "=", emptyNode());
  mutateWeakMap(cameraByLayer, layer, "=", createSceneCamera());
  mutateWeakMap(rendererByLayer, layer, "=", /* alloc */ {
    device,
    context,
    format,
    canvas,
    dpr: Math.min(window.devicePixelRatio, 2)
  });
  initializeRendererResources(layer, device);
  mountRenderer(layer, map, canvas);
}

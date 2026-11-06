import { sceneByLayer } from '../globals/sceneByLayer.js';
import { rendererDevices } from '../globals/rendererDevices.js';
import { emptyNode } from './emptyNode.js';
import { failAttachment } from './failAttachment.js';
import { requestAdapter } from './requestAdapter.js';
import { requestDevice } from './requestDevice.js';
import { rendererDeviceError } from './rendererDeviceError.js';
import { rendererDeviceLost } from './rendererDeviceLost.js';
import { createSceneCamera } from './createSceneCamera.js';
import { initializeRendererResources } from './initializeRendererResources.js';
import { mountRenderer } from './mountRenderer.js';

export async function initializeSharedRenderer(backend, map) {
  const canvas = document.createElement('canvas');
  if (!navigator.gpu) {
    failAttachment(/* alloc */ new Error('Layer3D requires WebGPU'), backend, map);
  }
  const adapter = await requestAdapter(backend, map);
  const device = await requestDevice(adapter, backend, map);
  rendererDevices.set(device, map);
  device.addEventListener('uncapturederror', rendererDeviceError);
  Promise.all(/* alloc */ [device.lost, Promise.resolve(device)]).then(rendererDeviceLost);
  const context = canvas.getContext('webgpu');
  if (!context) {
    device.destroy();
    failAttachment(/* alloc */ new Error('Unable to create a WebGPU canvas context'), backend, map);
  }
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure(/* alloc */ { device, format, alphaMode: 'premultiplied' });
  map.getContainer().querySelector('.leaflet-webgpu-warning')?.remove();
  sceneByLayer.get(backend)._shared = backend;
  sceneByLayer.get(backend)._layers = /* alloc */ new Set();
  sceneByLayer.get(backend)._sceneOrigin = sceneByLayer.get(backend).location;
  sceneByLayer.get(backend).scene = emptyNode();
  sceneByLayer.get(backend).camera = createSceneCamera();
  sceneByLayer.get(backend).renderer = /* alloc */ {
    device,
    context,
    format,
    canvas,
    dpr: Math.min(window.devicePixelRatio, 2)
  };
  initializeRendererResources(backend, device);
  mountRenderer(backend, map, canvas);
}

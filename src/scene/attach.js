import { cityMapper } from '../constants/cityMapper.js';
import { emptyNode } from './emptyNode.js';
import { setParent } from './setParent.js';
import { createProgram } from '../rendering/createProgram.js';
import { endZoom } from './endZoom.js';
import { onMapChange } from './onMapChange.js';
import { onZoomAnim } from './onZoomAnim.js';
import { render } from '../rendering/render.js';
import { startZoom } from './startZoom.js';
import { update } from './update.js';
import { updateArea } from '../sources/updateArea.js';
import { setTerrainHeight } from '../terrain/setTerrainHeight.js';
import { resizeSunlight } from '../shadows/resizeSunlight.js';
import { attachState } from '../constants/attachState.js';
import { noOperation } from '../utils/noOperation.js';
import { failAttachment } from './failAttachment.js';
import { requestAdapter } from './requestAdapter.js';
import { requestDevice } from './requestDevice.js';
import { rendererDeviceError } from './rendererDeviceError.js';
import { rendererDeviceLost } from './rendererDeviceLost.js';
import { restoreObject } from './restoreObject.js';

attachState.rendererDevices = new WeakMap();

/** WebGPU device attachment, materials/pipelines and draw calls. */
/**
 * Join/create this map's shared scene and rebuild GPU objects if its context changed.
 * Buffer/program handles belong to one context; typed arrays and decoded images do not.
 * @private
 */

export async function attach(backend, map) {
  let shared = cityMapper.renderers.get(map);
  if (shared?._rendererReady) {
    await shared._rendererReady.promise;
  }
  if (!shared) {
    shared = backend;
    backend._rendererReady = Promise.withResolvers();
    backend._rendererReady.promise.catch(noOperation);
    cityMapper.renderers.set(map, shared);
    const canvas = document.createElement('canvas');
    if (!navigator.gpu) {
      failAttachment(new Error('Layer3D requires WebGPU'), backend, map);
    }
    const adapter = await requestAdapter(backend, map);
    const device = await requestDevice(adapter, backend, map);
    attachState.rendererDevices.set(device, map);
    device.addEventListener('uncapturederror', rendererDeviceError);
    Promise.all([device.lost, Promise.resolve(device)]).then(rendererDeviceLost);
    const context = canvas.getContext('webgpu');
    if (!context) {
      device.destroy();
      failAttachment(new Error('Unable to create a WebGPU canvas context'), backend, map);
    }
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: 'premultiplied' });
    map.getContainer().querySelector('.leaflet-webgpu-warning')?.remove();
    backend._shared = backend;
    backend._layers = new Set();
    backend._sceneOrigin = backend.location;
    backend.scene = emptyNode();
    // Perspective camera state: fov in degrees, near/far in scene metres.
    backend.camera = {
      position: [0, 0, 0],
      up: [0, 1, 0],
      target: [0, 0, 0],
      viewMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      projectionMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      projectionViewMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      fov: 45,
      aspect: 1,
      near: 0.1,
      far: 10000,
    };
    backend.renderer = {
      device,
      context,
      format,
      canvas,
      dpr: Math.min(window.devicePixelRatio, 2)
    };
    const layout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'depth' } },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'comparison' } },
        { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
      ]
    });
    const buffer = backend.renderer.device.createBuffer({ size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const sampler = backend.renderer.device.createSampler({ compare: 'less-equal', minFilter: 'linear', magFilter: 'linear' });
    const lights = backend.renderer.device.createBuffer({ size: 32, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    backend.renderer.sunlight = { layout, buffer, sampler, lights, size: 0 };
    const values = new Float32Array(20);
    values.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    backend.renderer.device.queue.writeBuffer(buffer, 0, values);
    resizeSunlight(backend, 1);
    const emptyImage = document.createElement('canvas');
    emptyImage.width = 1;
    emptyImage.height = 1;
    backend.renderer.roofFallbackTexture = {
      device,
      texture: device.createTexture({
        size: [1, 1],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      }),
      sampler: device.createSampler({
        addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge',
      }),
      image: emptyImage, format: 'rgba8unorm', srgb: false, uploaded: null,
    };
    shared._size = null;
    canvas.className = 'leaflet-3d';
    canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', backend.options.ariaLabel ?? '3D scene');
    let pane = map.getPane('webgpuPane');
    if (!pane) {
      pane = map.createPane('webgpuPane', map.getContainer());
      // The pitch sky uses 0 and may be inserted after this pane.
      pane.style.zIndex = 1;
      pane.style.pointerEvents = 'none';
    }
    pane.append(canvas);
    map.on('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange, shared);
    map.on('zoomstart', startZoom, shared);
    map.on('zoomanim', onZoomAnim, shared);
    map.on('zoomend', endZoom, shared);
    backend._rendererReady.resolve();
    delete shared._rendererReady;
    render(shared);
    cityMapper.renderers.set(map, shared);
  }
  const origin = map.options.crs.project(shared._sceneOrigin);
  const point = map.options.crs.project(backend.location);
  const metres = Math.cos(shared._sceneOrigin.lat * Math.PI / 180);
  backend._terrainBaseY ??= backend.root.position[1];
  backend.root.position[0] = (point.x - origin.x) * metres;
  backend.root.position[1] = backend._terrainBaseY;
  backend.root.position[2] = -(point.y - origin.y) * metres;
  setTerrainHeight(backend);
  // Each group's metres are measured at its own latitude, not the shared camera origin.
  backend.root.scale.fill(metres / Math.cos(backend.location.lat * Math.PI / 180));
  backend._shared = shared;
  backend.renderer = shared.renderer;
  backend.scene = shared.scene;
  backend.camera = shared.camera;
  shared._layers.add(backend);
  setParent(backend.root, shared.scene);
  const pendingObjects = [backend.root];
  while (pendingObjects.length) {
    const object = pendingObjects.pop();
    restoreObject(backend, shared, object);
    for (let i = object.children.length - 1; i >= 0; i--) pendingObjects.push(object.children[i]);
  }
  update(shared);
  if ((backend.header && backend._type !== 'pmtiles') || backend._geojson) updateArea(backend);
}

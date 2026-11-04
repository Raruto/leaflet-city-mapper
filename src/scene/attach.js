import { emptyNode } from './emptyNode.js';
import { setParent } from './setParent.js';
import { traverse } from './traverse.js';
import { createProgram } from '../rendering/createProgram.js';
import { endZoom } from './endZoom.js';
import { onMapChange } from './onMapChange.js';
import { onZoomAnim } from './onZoomAnim.js';
import { render } from '../rendering/render.js';
import { startZoom } from './startZoom.js';
import { update } from './update.js';
import { updateArea } from './updateArea.js';
import { setTerrainHeight } from '../terrain/setTerrainHeight.js';
import { resizeSunlight } from '../sunlight/resizeSunlight.js';

function showWebGPUWarning(map) {
  const container = map.getContainer();
  if (container.querySelector('.leaflet-webgpu-warning')) return;
  const warning = document.createElement('div');
  warning.className = 'leaflet-webgpu-warning';
  warning.setAttribute('role', 'alert');
  warning.style.cssText = 'position:absolute;z-index:1000;top:50%;left:50%;transform:translate(-50%,-50%);max-width:calc(100% - 32px);box-sizing:border-box;padding:12px 16px;border:1px solid #c98b24;border-radius:6px;background:#fff8e6;box-shadow:0 3px 12px #0005;color:#30251d;font:14px/1.5 sans-serif;text-align:center;pointer-events:auto';
  warning.append('WebGPU is not available in this browser or device. ');
  const link = document.createElement('a');
  link.href = 'https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API#browser_compatibility';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Learn more';
  warning.append(link);
  container.append(warning);
}

/** WebGPU device attachment, materials/pipelines and draw calls. */
/**
 * Join/create this map's shared scene and rebuild GPU objects if its context changed.
 * Buffer/program handles belong to one context; typed arrays and decoded images do not.
 * @private
 */

export async function attach(backend, map) {
  let shared = L.Layer._renderers.get(map);
  if (shared?._rendererReady) {
    await shared._rendererReady.promise;
  }
  if (!shared) {
    shared = backend;
    backend._rendererReady = Promise.withResolvers();
    backend._rendererReady.promise.catch(() => { });
    L.Layer._renderers.set(map, shared);
    const fail = error => {
      showWebGPUWarning(map);
      backend._rendererReady.reject(error);
      L.Layer._renderers.delete(map);
      throw error;
    };
    const canvas = document.createElement('canvas');
    if (!navigator.gpu) {
      fail(new Error('Layer3D requires WebGPU'));
    }
    const adapter = await navigator.gpu.requestAdapter().catch(fail);
    if (!adapter) {
      fail(new Error('Unable to acquire a WebGPU adapter'));
    }
    const device = await adapter.requestDevice().catch(fail);
    device.addEventListener('uncapturederror', event => {
      const owner = L.Layer._renderers.get(map);
      if (owner?.renderer?.device !== device) {
        return;
      }
      for (const layer of owner?._layers || []) {
        layer.fire('error', { error: event.error });
      }
    });
    device.lost.then(info => {
      const owner = L.Layer._renderers.get(map);
      if (!owner || owner.renderer?.device !== device) {
        return;
      }
      const error = new Error(`WebGPU device lost: ${info.message || info.reason}`);
      for (const layer of owner._layers) {
        layer.fire('error', { error });
      }
    });
    const context = canvas.getContext('webgpu');
    if (!context) {
      device.destroy();
      fail(new Error('Unable to create a WebGPU canvas context'));
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
    L.Layer._renderers.set(map, shared);
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
  traverse(backend.root, object => {
    if (object.geometry && object.geometry.device !== shared.renderer.device) {
      const geometry = object.geometry;
      const material = object.program._layerMaterial;
      // Retain packed CPU attributes, never old-context GPU buffer handles.
      const attributes = {};
      for (const name of ['position', 'normal', 'color', 'uv', 'index']) {
        const attribute = geometry.attributes[name];
        if (!attribute) continue;
        const { data, size, count, normalized } = attribute;
        attributes[name] = { data: data.slice(0, count * size), size, normalized };
      }
      const device = shared.renderer.device;
      if (attributes.index?.data instanceof Uint8Array) {
        attributes.index.data = Uint16Array.from(attributes.index.data);
      }
      for (const [name, attribute] of Object.entries(attributes)) {
        attribute.size ||= 1;
        attribute.count = attribute.data.length / attribute.size;
        attribute.indexFormat = attribute.data instanceof Uint32Array ? 'uint32' : 'uint16';
        attribute.buffer = device.createBuffer({
          size: Math.max(4, attribute.data.byteLength),
          usage: name === 'index'
            ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
            : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
      }
      object.geometry = {
        device,
        attributes,
        drawRange: { start: 0, count: attributes.index?.count || attributes.position.count },
      };
      for (const attribute of Object.values(geometry.attributes)) attribute.buffer.destroy();
      object.bindGroup = null;
      object.boundTextures = [];
      for (const key of ['baseTexture', 'metalTexture', 'emissiveTexture', 'occlusionTexture']) {
        const texture = material[key];
        if (!texture || texture.device === device) continue;
        material[key] = {
          ...texture,
          device,
          texture: device.createTexture({
            size: [texture.image.width, texture.image.height],
            format: texture.format,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
          }),
          sampler: device.createSampler(texture.samplerOptions),
          uploaded: null,
        };
      }
      object.program.pipelineCache.clear();
      object.program = createProgram(backend, material);
      object.device = device;
    }
    if (object.texture && object.texture.device !== shared.renderer.device) {
      object.texture = {
        ...object.texture,
        device: shared.renderer.device,
        texture: shared.renderer.device.createTexture({
          size: [object.texture.image.width, object.texture.image.height],
          format: object.texture.format,
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        }),
        sampler: shared.renderer.device.createSampler(object.texture.samplerOptions),
        uploaded: null,
      };
    }
  });
  update(shared);
  if ((backend.header && backend._type !== 'pmtiles') || backend._geojson) updateArea(backend);
}

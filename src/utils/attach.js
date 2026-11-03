import { emptyNode } from './emptyNode.js';
import { setParent } from './setParent.js';
import { traverse } from './traverse.js';
import { createProgram } from './createProgram.js';
import { endZoom } from './endZoom.js';
import { initSunlight } from './initSunlight.js';
import { onMapChange } from './onMapChange.js';
import { onZoomAnim } from './onZoomAnim.js';
import { render } from './render.js';
import { startZoom } from './startZoom.js';
import { update } from './update.js';
import { updateArea } from './updateArea.js';

/** WebGPU device attachment, materials/pipelines and draw calls. */
/**
 * Join/create this map's shared scene and rebuild GPU objects if its context changed.
 * Buffer/program handles belong to one context; typed arrays and decoded images do not.
 * @private
 */

export async function attach(backend, map) {
  let shared = L.Layer.types['3d']._renderers.get(map);
  if (shared?._rendererReady) {
    await shared._rendererReady.promise;
  }
  if (!shared) {
    shared = backend;
    backend._rendererReady = Promise.withResolvers();
    backend._rendererReady.promise.catch(() => { });
    L.Layer.types['3d']._renderers.set(map, shared);
    const fail = error => {
      backend._rendererReady.reject(error);
      L.Layer.types['3d']._renderers.delete(map);
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
      const owner = L.Layer.types['3d']._renderers.get(map);
      if (owner?.renderer?.device !== device) {
        return;
      }
      for (const layer of owner?._layers || []) {
        layer.fire('error', { error: event.error });
      }
    });
    device.lost.then(info => {
      const owner = L.Layer.types['3d']._renderers.get(map);
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
    initSunlight(backend);
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
    canvas.setAttribute('aria-label', backend.options.ariaLabel);
    let pane = map.getPane('webgpuPane');
    if (!pane) {
      pane = map.createPane('webgpuPane', map.getContainer());
      pane.style.zIndex = 450;
    }
    pane.append(canvas);
    map.on('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange, shared);
    map.on('zoomstart', startZoom, shared);
    map.on('zoomanim', onZoomAnim, shared);
    map.on('zoomend', endZoom, shared);
    backend._rendererReady.resolve();
    delete shared._rendererReady;
    render(shared);
    L.Layer.types['3d']._renderers.set(map, shared);
  }
  const origin = map.options.crs.project(shared._sceneOrigin);
  const point = map.options.crs.project(backend.location);
  const metres = Math.cos(shared._sceneOrigin.lat * Math.PI / 180);
  backend._terrainBaseY ??= backend.root.position[1];
  backend.root.position[0] = (point.x - origin.x) * metres;
  backend.root.position[1] = backend._terrainBaseY;
  backend.root.position[2] = -(point.y - origin.y) * metres;
  backend._setTerrainHeight();
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
  if (backend.header || backend._geojson) updateArea(backend);
}

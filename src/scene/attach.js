import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

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

import { noOperation } from '../utils/noOperation.js';
import { failAttachment } from './failAttachment.js';
import { requestAdapter } from './requestAdapter.js';
import { requestDevice } from './requestDevice.js';
import { rendererDeviceError } from './rendererDeviceError.js';
import { rendererDeviceLost } from './rendererDeviceLost.js';
import { restoreObject } from './restoreObject.js';
import { traverse } from './traverse.js';

/** WebGPU device attachment, materials/pipelines and draw calls. */
/**
 * Join/create this map's shared scene and rebuild GPU objects if its context changed.
 * Buffer/program handles belong to one context; typed arrays and decoded images do not.
 * @private
 */

export async function attach(backend, map) {
  let shared = sharedState.renderers.get(map);
  if (pluginState(shared)?._rendererReady) {
    await pluginState(shared)._rendererReady.promise;
  }
  if (!shared) {
    shared = backend;
    pluginState(backend)._rendererReady = Promise.withResolvers();
    pluginState(backend)._rendererReady.promise.catch(noOperation);
    sharedState.renderers.set(map, shared);
    const canvas = document.createElement('canvas');
    if (!navigator.gpu) {
      failAttachment(/* allocation: required -- Preserve the cause and stack for this attachment failure. */ new Error('Layer3D requires WebGPU'), backend, map);
    }
    const adapter = await requestAdapter(backend, map);
    const device = await requestDevice(adapter, backend, map);
    sharedState.rendererDevices.set(device, map);
    device.addEventListener('uncapturederror', rendererDeviceError);
    Promise.all(/* allocation: required -- Correlate this device's loss with its owning map. */ [device.lost, Promise.resolve(device)]).then(rendererDeviceLost);
    const context = canvas.getContext('webgpu');
    if (!context) {
      device.destroy();
      failAttachment(/* allocation: required -- Preserve the cause and stack for this attachment failure. */ new Error('Unable to create a WebGPU canvas context'), backend, map);
    }
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure(/* allocation: required -- Provide the WebGPU configuration snapshot. */ { device, format, alphaMode: 'premultiplied' });
    map.getContainer().querySelector('.leaflet-webgpu-warning')?.remove();
    pluginState(backend)._shared = backend;
    pluginState(backend)._layers = /* allocation: required -- Track source ownership independently for this renderer. */ new Set();
    pluginState(backend)._sceneOrigin = pluginState(backend).location;
    pluginState(backend).scene = emptyNode();
    // Perspective camera state: fov in degrees, near/far in scene metres.
    pluginState(backend).camera = /* allocation: required -- Camera state is independently owned by each map renderer. */ {
      position: /* allocation: required -- Keep camera coordinates independent. */ [0, 0, 0],
      up: /* allocation: required -- Keep camera coordinates independent. */ [0, 1, 0],
      target: /* allocation: required -- Keep camera coordinates independent. */ [0, 0, 0],
      x: /* allocation: required -- Reuse the camera's right-axis buffer. */ [0, 0, 0],
      y: /* allocation: required -- Reuse the camera's up-axis buffer. */ [0, 0, 0],
      z: /* allocation: required -- Reuse the camera's forward-axis buffer. */ [0, 0, 0],
      viewMatrix: /* allocation: required -- Keep each map's view matrix independent. */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      projectionMatrix: /* allocation: required -- Keep each map's projection matrix independent. */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      projectionViewMatrix: /* allocation: required -- Keep each map's combined matrix independent. */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      viewTransform: /* allocation: required -- Reuse a transform matrix owned by this camera. */ new DOMMatrix(),
      projectionTransform: /* allocation: required -- Reuse a transform matrix owned by this camera. */ new DOMMatrix(),
      projectionViewTransform: /* allocation: required -- Reuse a transform matrix owned by this camera. */ new DOMMatrix(),
      fov: 45,
      aspect: 1,
      near: 0.1,
      far: 10000,
    };
    pluginState(backend).renderer = /* allocation: required -- Keep renderer resources scoped to this map. */ {
      device,
      context,
      format,
      canvas,
      dpr: Math.min(window.devicePixelRatio, 2)
    };
    const layout = device.createBindGroupLayout(/* allocation: required -- WebGPU consumes a fresh bind layout descriptor. */ {
      entries: /* allocation: required -- Keep the four binding descriptions ordered for this layout. */ [
        /* allocation: required -- Describe this layout's uniform binding. */ { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: /* allocation: required -- Specify this binding's uniform buffer type. */ { type: 'uniform' } },
        /* allocation: required -- Describe this layout's depth binding. */ { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: /* allocation: required -- Specify this binding's depth texture type. */ { sampleType: 'depth' } },
        /* allocation: required -- Describe this layout's comparison sampler. */ { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: /* allocation: required -- Specify this binding's comparison sampler type. */ { type: 'comparison' } },
        /* allocation: required -- Describe this layout's storage binding. */ { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: /* allocation: required -- Specify this binding's read-only storage type. */ { type: 'read-only-storage' } },
      ]
    });
    const buffer = pluginState(backend).renderer.device.createBuffer(/* allocation: required -- Configure the renderer's uniform storage. */ { size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const sampler = pluginState(backend).renderer.device.createSampler(/* allocation: required -- Configure the renderer's comparison sampler. */ { compare: 'less-equal', minFilter: 'linear', magFilter: 'linear' });
    const lights = pluginState(backend).renderer.device.createBuffer(/* allocation: required -- Configure this renderer's light storage. */ { size: 32, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    pluginState(backend).renderer.sunlight = /* allocation: required -- Retain sunlight resources for this renderer. */ { layout, buffer, sampler, lights, size: 0 };
    pluginState(backend).renderer.device.queue.writeBuffer(buffer, 0, sharedState.allocationSceneSunlightUniforms);
    resizeSunlight(backend, 1);
    const emptyImage = document.createElement('canvas');
    emptyImage.width = 1;
    emptyImage.height = 1;
    pluginState(backend).renderer.roofFallbackTexture = /* allocation: required -- Retain fallback resources for this renderer. */ {
      device,
      texture: device.createTexture(/* allocation: required -- Supply a fresh fallback texture descriptor. */ {
        size: /* allocation: required -- Provide the fallback image dimensions. */ [1, 1],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      }),
      sampler: device.createSampler(/* allocation: required -- Supply a fresh fallback sampler descriptor. */ {
        addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge',
      }),
      image: emptyImage, format: 'rgba8unorm', srgb: false, uploaded: null,
    };
    pluginState(shared)._size = null;
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
    pluginState(backend)._rendererReady.resolve();
    delete pluginState(shared)._rendererReady;
    render(shared);
    sharedState.renderers.set(map, shared);
  }
  const origin = map.options.crs.project(pluginState(shared)._sceneOrigin);
  const point = map.options.crs.project(pluginState(backend).location);
  const metres = Math.cos(pluginState(shared)._sceneOrigin.lat * Math.PI / 180);
  pluginState(backend)._terrainBaseY ??= pluginState(backend).root.position[1];
  pluginState(backend).root.position[0] = (point.x - origin.x) * metres;
  pluginState(backend).root.position[1] = pluginState(backend)._terrainBaseY;
  pluginState(backend).root.position[2] = -(point.y - origin.y) * metres;
  setTerrainHeight(backend);
  // Each group's metres are measured at its own latitude, not the shared camera origin.
  pluginState(backend).root.scale.fill(metres / Math.cos(pluginState(backend).location.lat * Math.PI / 180));
  pluginState(backend)._shared = shared;
  pluginState(backend).renderer = pluginState(shared).renderer;
  pluginState(backend).scene = pluginState(shared).scene;
  pluginState(backend).camera = pluginState(shared).camera;
  pluginState(shared)._layers.add(backend);
  setParent(pluginState(backend).root, pluginState(shared).scene);
  traverse(pluginState(backend).root, restoreObject, backend);
  update(shared);
  if ((pluginState(backend).header && pluginState(backend)._type !== 'pmtiles') || pluginState(backend)._geojson) updateArea(backend);
}

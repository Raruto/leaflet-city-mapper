import { layersByLayer } from '../weakmaps/layersByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { destroyTexture } from '../textures/destroyTexture.js';
import { bindSunlight } from '../shadows/bindSunlight.js';
import { cacheLightGrid } from './cacheLightGrid.js';
import { collectLightMeshes } from './collectLightMeshes.js';

/**
 * Cache and upload fixed and moving point-light grids for the shared renderer.
 *
 * @param {L.Layer} layer Layer owning the shared renderer.
 *
 * @throws {Error} If the combined grids exceed the GPU storage limit.
 */
export function updatePointLights(layer) {
  const { device, sunlight: sun } = rendererByLayer.get(layer);
  const fixed = /* alloc */ [];
  const moving = /* alloc */ [];
  let sceneLayer;
  for (sceneLayer of layersByLayer.get(layer)) {
    if (!sceneLayer.options.nightLight || !rootByLayer.get(sceneLayer).visible) continue;
    collectLightMeshes(rootByLayer.get(sceneLayer), fixed, moving);
  }
  const maxBytes = device.limits.maxStorageBufferBindingSize;
  const staticGrid = cacheLightGrid(fixed, sun.staticLightGrid, maxBytes);
  const dynamicGrid = cacheLightGrid(moving, sun.dynamicLightGrid, maxBytes);
  if (staticGrid === sun.staticLightGrid && dynamicGrid === sun.dynamicLightGrid) return;
  const size = staticGrid.data.byteLength + dynamicGrid.data.byteLength;
  if (size > maxBytes) throw /* alloc */ new Error('Streetlight grid exceeds GPU storage limit');
  let uploadStatic = staticGrid !== sun.staticLightGrid;
  if (sun.lights.size < size) {
    destroyTexture(layer, sun.lights);
    sun.lights = device.createBuffer(/* alloc */ { size, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    bindSunlight(layer);
    uploadStatic = true;
  }
  // The spare header component points to a second grid in the same storage binding.
  staticGrid.data[6] = staticGrid.data.length / 4;
  if (uploadStatic) device.queue.writeBuffer(sun.lights, 0, staticGrid.data);
  device.queue.writeBuffer(sun.lights, staticGrid.data.byteLength, dynamicGrid.data);
  sun.lightCount = staticGrid.count + dynamicGrid.count;
  sun.staticLightGrid = staticGrid;
  sun.dynamicLightGrid = dynamicGrid;
}

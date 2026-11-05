import { pluginState } from '../core/pluginState.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { bindSunlight } from '../shadows/bindSunlight.js';
import { cacheLightGrid } from './cacheLightGrid.js';
import { collectLightMeshes } from './collectLightMeshes.js';

export function updatePointLights(backend) {
  const { device, sunlight: sun } = pluginState(backend).renderer;
  const fixed = /* allocation: required -- Fixed-light traversal stays private across reentrant device callbacks. */ [];
  const moving = /* allocation: required -- Moving-light traversal stays private across reentrant device callbacks. */ [];
  let layer;
  for (layer of pluginState(backend)._layers) {
    if (!layer.options.nightLight || !pluginState(layer).root.visible) continue;
    collectLightMeshes(pluginState(layer).root, fixed, moving);
  }
  const maxBytes = device.limits.maxStorageBufferBindingSize;
  const staticGrid = cacheLightGrid(fixed, sun.staticLightGrid, maxBytes);
  const dynamicGrid = cacheLightGrid(moving, sun.dynamicLightGrid, maxBytes);
  if (staticGrid === sun.staticLightGrid && dynamicGrid === sun.dynamicLightGrid) return;
  const size = staticGrid.data.byteLength + dynamicGrid.data.byteLength;
  if (size > maxBytes) throw /* allocation: required -- Storage errors retain the failing renderer update stack. */ new Error('Streetlight grid exceeds GPU storage limit');
  let uploadStatic = staticGrid !== sun.staticLightGrid;
  if (sun.lights.size < size) {
    destroyTexture(backend, sun.lights);
    sun.lights = device.createBuffer(/* allocation: required -- The device receives an independent descriptor for this renderer-owned light buffer. */ { size, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    bindSunlight(backend);
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

import { lightGrid } from './lightGrid.js';
import { worldLights } from './worldLights.js';
import { destroyTexture } from './destroyTexture.js';
import { bindSunlight } from '../sunlight/bindSunlight.js';

/** Keep fixed lamps cached when moving headlights change. */

export function cacheLightGrid(meshes, previous, maxBytes) {
  let unchanged = previous?.meshes.length === meshes.length;
  const packed = [], snapshots = [];
  for (let i = 0; i < meshes.length; i++) {
    const mesh = meshes[i], matrix = mesh.worldMatrix, lights = mesh.extras.lights;
    let cache = mesh._worldLights;
    let sameMatrix = Boolean(cache);
    for (let j = 0; j < matrix.length && sameMatrix; j++) sameMatrix = matrix[j] === cache.matrix[j];
    if (!sameMatrix || cache.lights !== lights) {
      cache = mesh._worldLights = { lights, matrix: [...matrix], data: worldLights(lights, matrix) };
    }
    unchanged &&= previous.meshes[i].mesh === mesh && previous.meshes[i].cache === cache;
    packed.push(cache.data);
    snapshots.push({ mesh, cache });
  }
  if (unchanged) return previous;
  return { ...lightGrid(packed, maxBytes), meshes: snapshots };
}

export function updatePointLights(backend) {
  const { device, sunlight: sun } = backend.renderer;
  const fixed = [], moving = [];
  for (const layer of backend._layers) {
    if (!layer.options.nightLight || !layer.root.visible) continue;
    collectLightMeshes(layer.root, fixed, moving);
  }
  const maxBytes = device.limits.maxStorageBufferBindingSize;
  const staticGrid = cacheLightGrid(fixed, sun.staticLightGrid, maxBytes);
  const dynamicGrid = cacheLightGrid(moving, sun.dynamicLightGrid, maxBytes);
  if (staticGrid === sun.staticLightGrid && dynamicGrid === sun.dynamicLightGrid) return;
  const size = staticGrid.data.byteLength + dynamicGrid.data.byteLength;
  if (size > maxBytes) throw new Error('Streetlight grid exceeds GPU storage limit');
  let uploadStatic = staticGrid !== sun.staticLightGrid;
  if (sun.lights.size < size) {
    destroyTexture(backend, sun.lights);
    sun.lights = device.createBuffer({ size, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
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

function collectLightMeshes(node, fixed, moving) {
  if (!node.visible) return;
  if (node.extras?.lights) (node.extras.dynamicLights ? moving : fixed).push(node);
  for (const child of node.children || []) collectLightMeshes(child, fixed, moving);
}

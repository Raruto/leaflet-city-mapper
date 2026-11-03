import { lightGrid } from './lightGrid.js';
import { traverse } from './traverse.js';
import { worldLights } from './worldLights.js';
import { destroyTexture } from './destroyTexture.js';
import { bindSunlight } from './bindSunlight.js';

/** A cached spatial grid limits fragment lighting to nearby lamps, without dropping dense cells. */

export function updatePointLights(backend) {
  const { device, sunlight: sun } = backend.renderer;
  const meshes = [];
  for (const layer of backend._layers) {
    if (!layer.options.nightLight || !layer.root.visible) continue;
    traverse(layer.root, mesh => {
      if (!mesh.visible) return true;
      if (mesh.extras?.lights) meshes.push(mesh);
    });
  }
  if (sun.lightMeshes?.length === meshes.length && meshes.every((mesh, i) => sun.lightMeshes[i].mesh === mesh &&
    sun.lightMeshes[i].lights === mesh.extras.lights && mesh.worldMatrix.every((v, j) => v === sun.lightMeshes[i].matrix[j]))) return;
  // Per mesh, world-space [x, y, z, radius, r, g, b, intensity] per light: re-packed only when its lights or matrix change.
  const packed = meshes.map(mesh => {
    const cache = mesh._worldLights, m = mesh.worldMatrix, lights = mesh.extras.lights;
    if (cache?.lights === lights && m.every((v, j) => v === cache.matrix[j])) return cache.data;
    const values = worldLights(lights, m);
    mesh._worldLights = { lights, matrix: [...m], data: values };
    return values;
  });
  const { data, count } = lightGrid(packed, device.limits.maxStorageBufferBindingSize);
  if (sun.lights.size < data.byteLength) {
    destroyTexture(backend, sun.lights);
    sun.lights = device.createBuffer({ size: data.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    bindSunlight(backend);
  }
  device.queue.writeBuffer(sun.lights, 0, data);
  sun.lightCount = count;
  sun.lightMeshes = meshes.map(mesh => ({ mesh, lights: mesh.extras.lights, matrix: [...mesh.worldMatrix] }));
}

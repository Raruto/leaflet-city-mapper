import { shadowCacheMatches } from './shadowCacheMatches.js';
import { shadowMatrix } from './shadowMatrix.js';
import { ensureShadowPipeline } from './ensureShadowPipeline.js';
import { drawShadowMeshes } from './drawShadowMeshes.js';
import { resizeSunlight } from './resizeSunlight.js';

/** One shared directional depth map. Off-screen but loaded geometry can cast shadows. */

export function renderSunlight(backend, encoder, meshes, sunlight) {
  const renderer = backend.renderer, device = renderer.device, sun = renderer.sunlight;
  if (!meshes.length || !sunlight || sunlight.altitude < 3) {
    if (!sun.enabled) return;
    const values = new Float32Array(20);
    values.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    device.queue.writeBuffer(sun.buffer, 0, values);
    sun.enabled = false;
    sun.cache = null;
    return;
  }
  if (shadowCacheMatches(sun, meshes, sunlight)) return;
  const values = new Float32Array(20);
  sun.enabled = true;
  resizeSunlight(backend, Math.min(2048, device.limits.maxTextureDimension2D));
  values.set(shadowMatrix(meshes, sunlight));
  values[16] = 1;
  device.queue.writeBuffer(sun.buffer, 0, values);
  ensureShadowPipeline(device, sun);
  drawShadowMeshes(backend, encoder, meshes);
  const snapshots = new Map();
  for (const mesh of meshes) {
    snapshots.set(mesh, {
      world: mesh._worldMatrixVersion, geometry: mesh.geometry,
      start: mesh.geometry.drawRange.start, count: mesh.geometry.drawRange.count,
      appearance: mesh._appearance ?? 1,
    });
  }
  sun.cache = { direction: [...sunlight.direction], meshes: snapshots };
}

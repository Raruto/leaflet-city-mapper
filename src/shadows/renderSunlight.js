import { sceneByLayer } from '../globals/sceneByLayer.js';
import { disabledShadow } from '../globals/disabledShadow.js';
import { shadowValues } from '../globals/shadowValues.js';

import { shadowCacheMatches } from './shadowCacheMatches.js';
import { shadowMatrix } from './shadowMatrix.js';
import { ensureShadowPipeline } from './ensureShadowPipeline.js';
import { drawShadowMeshes } from './drawShadowMeshes.js';
import { resizeSunlight } from './resizeSunlight.js';

/** One shared directional depth map. Off-screen but loaded geometry can cast shadows. */

export function renderSunlight(backend, encoder, meshes, sunlight) {
  const renderer = sceneByLayer.get(backend).renderer, device = renderer.device, sun = renderer.sunlight;
  if (!meshes.length || !sunlight || sunlight.altitude < 3) {
    if (!sun.enabled) return;
    device.queue.writeBuffer(sun.buffer, 0, disabledShadow);
    sun.enabled = false;
    sun.cache = null;
    return;
  }
  if (shadowCacheMatches(sun, meshes, sunlight)) return;
  const values = shadowValues;
  sun.enabled = true;
  resizeSunlight(backend, Math.min(2048, device.limits.maxTextureDimension2D));
  values.set(shadowMatrix(meshes, sunlight));
  values[16] = 1;
  device.queue.writeBuffer(sun.buffer, 0, values);
  ensureShadowPipeline(device, sun);
  let mesh;
  for (mesh of meshes) {
    if (mesh.geometry.attributes.instanceOffset) {
      ensureShadowPipeline(device, sun, true);
      break;
    }
  }
  drawShadowMeshes(backend, encoder, meshes);
  const snapshots = /* alloc */ new Map();
  let mesh2;
  for (mesh2 of meshes) {
    snapshots.set(mesh2, /* alloc */ {
      world: mesh2._worldMatrixVersion, geometry: mesh2.geometry,
      start: mesh2.geometry.drawRange.start, count: mesh2.geometry.drawRange.count,
      appearance: mesh2._appearance ?? 1,
    });
  }
  sun.cache = /* alloc */ { direction: /* alloc */ [...sunlight.direction], meshes: snapshots };
}

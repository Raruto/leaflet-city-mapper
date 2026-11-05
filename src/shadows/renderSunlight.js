import { pluginState } from '../core/pluginState.js';
import { shadowCacheMatches } from './shadowCacheMatches.js';
import { shadowMatrix } from './shadowMatrix.js';
import { ensureShadowPipeline } from './ensureShadowPipeline.js';
import { drawShadowMeshes } from './drawShadowMeshes.js';
import { resizeSunlight } from './resizeSunlight.js';

/** One shared directional depth map. Off-screen but loaded geometry can cast shadows. */

export function renderSunlight(backend, encoder, meshes, sunlight) {
  const renderer = pluginState(backend).renderer, device = renderer.device, sun = renderer.sunlight;
  if (!meshes.length || !sunlight || sunlight.altitude < 3) {
    if (!sun.enabled) return;
    device.queue.writeBuffer(sun.buffer, 0, sharedState.allocationRenderDisabledShadow);
    sun.enabled = false;
    sun.cache = null;
    return;
  }
  if (shadowCacheMatches(sun, meshes, sunlight)) return;
  const values = sharedState.allocationRenderShadowValues;
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
  const snapshots = /* allocation: required -- The sunlight cache retains this caster snapshot map until the next shadow update. */ new Map();
  let mesh2;
  for (mesh2 of meshes) {
    snapshots.set(mesh2, /* allocation: required -- The shadow cache retains each caster’s world version, geometry and draw-range snapshot independently. */ {
      world: mesh2._worldMatrixVersion, geometry: mesh2.geometry,
      start: mesh2.geometry.drawRange.start, count: mesh2.geometry.drawRange.count,
      appearance: mesh2._appearance ?? 1,
    });
  }
  sun.cache = /* allocation: required -- Each sunlight owner retains a separate direction and caster snapshot. */ { direction: /* allocation: required -- Cached light direction must not alias the mutable live sunlight direction. */ [...sunlight.direction], meshes: snapshots };
}
import { state as sharedState } from '../state.js';

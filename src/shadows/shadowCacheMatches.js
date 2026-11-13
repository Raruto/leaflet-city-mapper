import { shadowMeshMatches } from './shadowMeshMatches.js';

/**
 * Check whether the cached shadow map still matches sunlight and all meshes.
 *
 * @param {Object} sun Renderer sunlight state and shadow cache.
 * @param {Object[]} meshes Current shadow-casting meshes.
 * @param {Object} sunlight Current sunlight direction.
 *
 * @returns {boolean|undefined} Truthy if the cache is still valid.
 */
export function shadowCacheMatches(sun, meshes, sunlight) {
  const cache = sun.cache;
  let unchanged = sun.enabled && cache?.meshes.size === meshes.length;
  let i, mesh;
  if (unchanged) {
    for (i = 0; i < sunlight.direction.length; i++) {
      if (sunlight.direction[i] !== cache.direction[i]) { unchanged = false; break; }
    }
  }
  if (unchanged) {
    for (mesh of meshes) {
      if (!shadowMeshMatches(cache, mesh)) { unchanged = false; break; }
    }
  }
  return unchanged;
}

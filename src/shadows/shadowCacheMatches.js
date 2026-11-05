export function shadowCacheMatches(sun, meshes, sunlight) {
  const cache = sun.cache;
  let unchanged = sun.enabled && cache?.meshes.size === meshes.length;
  let i, mesh, previous, range, attribute;
  if (unchanged) {
    for (i = 0; i < sunlight.direction.length; i++) {
      if (sunlight.direction[i] !== cache.direction[i]) { unchanged = false; break; }
    }
  }
  if (unchanged) {
    for (mesh of meshes) {
      previous = cache.meshes.get(mesh), range = mesh.geometry.drawRange;
      if (!(previous && previous.world === mesh._worldMatrixVersion && previous.geometry === mesh.geometry &&
        previous.start === range.start && previous.count === range.count &&
        previous.appearance === (mesh._appearance ?? 1))) { unchanged = false; break; }
      for (attribute of Object.values(mesh.geometry.attributes)) {
        if (attribute.needsUpdate) { unchanged = false; break; }
      }
      if (!unchanged) break;
    }
  }
  return unchanged;
}

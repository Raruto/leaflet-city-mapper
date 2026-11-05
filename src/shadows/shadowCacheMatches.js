export function shadowCacheMatches(sun, meshes, sunlight) {
  const cache = sun.cache;
  let unchanged = sun.enabled && cache?.meshes.size === meshes.length;
  if (unchanged) {
    for (let i = 0; i < sunlight.direction.length; i++) {
      if (sunlight.direction[i] !== cache.direction[i]) { unchanged = false; break; }
    }
  }
  if (unchanged) {
    for (const mesh of meshes) {
      const previous = cache.meshes.get(mesh), range = mesh.geometry.drawRange;
      if (!(previous && previous.world === mesh._worldMatrixVersion && previous.geometry === mesh.geometry &&
        previous.start === range.start && previous.count === range.count &&
        previous.appearance === (mesh._appearance ?? 1))) { unchanged = false; break; }
      for (const attribute of Object.values(mesh.geometry.attributes)) {
        if (attribute.needsUpdate) { unchanged = false; break; }
      }
      if (!unchanged) break;
    }
  }
  return unchanged;
}

export async function getGridTerrainTile(state, z, x, y) {
  const limit = 2 ** z;
  x = ((x % limit) + limit) % limit;
  y = Math.max(0, Math.min(limit - 1, y));
  const key = `${z}/${x}/${y}`;
  let entry = state.terrainCache.get(key);
  if (!entry) {
    entry = /* alloc */ { promise: state.layer.options.getTile(z, x, y, state.terrainController.signal) };
    state.terrainCache.set(key, entry);
  } else {
    state.terrainCache.delete(key);
    state.terrainCache.set(key, entry);
  }
  try {
    if (!entry.data) entry.data = await entry.promise;
    if (!(entry.data instanceof Float32Array) || entry.data.length !== 65536) {
      throw /* alloc */ new Error(`Invalid elevation tile ${key}: expected 256x256 Float32Array`);
    }
    if (!entry.range) {
      let minimum = Infinity, maximum = -Infinity, elevation;
      for (elevation of entry.data) {
        if (!Number.isFinite(elevation) || elevation <= -1000) continue;
        minimum = Math.min(minimum, elevation);
        maximum = Math.max(maximum, elevation);
      }
      entry.range = /* alloc */ [minimum, maximum];
    }
  } catch (error) {
    if (state.terrainCache.get(key) === entry) state.terrainCache.delete(key);
    throw error;
  }
  while (state.terrainCache.size > 256) state.terrainCache.delete(state.terrainCache.keys().next().value);
  return entry.data;
}

/**
 * Retain terrain meshes and textures while replacement grid tiles are pending.
 *
 * @param {Object} state Native grid layer state.
 */
export function retainGridTerrain(state) {
  let key, mesh, retained;
  for ([key, mesh] of state.meshes) {
    if (state.source._tiles[key] || !mesh._terrainRequest) continue;
    retained = state.textures.get(key);
    if (!retained) continue;
    retained.used = true;
    mesh._nativeUsed = true;
  }
}

/**
 * Check whether rendered terrain belongs to an outgoing grid level.
 *
 * @param {Object} state Native grid layer state.
 *
 * @returns {boolean} Whether the layer is replacing its terrain level.
 */
export function gridTerrainTransition(state) {
  let mesh;
  for (mesh of state.meshes.values()) {
    if (mesh._terrainRequest && mesh._terrainRequest.tile.coords.z !== state.source._tileZoom) return true;
  }
  return false;
}

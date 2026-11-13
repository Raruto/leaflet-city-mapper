/**
 * Return the cached local-space bounds of a traffic vehicle template, computing them on first use.
 *
 * @param {Object} state Traffic layer state with a template position array.
 *
 * @returns {Object} Bounds with minX, maxX, minY, maxY, minZ and maxZ.
 */
export function trafficBounds(state) {
  if (state.collisionBounds) return state.collisionBounds;
  const bounds = state.collisionBounds = /* alloc */ {
    minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity,
  };
  const position = state.template.position;
  let i;
  for (i = 0; i < position.length; i += 3) {
    bounds.minX = Math.min(bounds.minX, position[i]);
    bounds.maxX = Math.max(bounds.maxX, position[i]);
    bounds.minY = Math.min(bounds.minY, position[i + 1]);
    bounds.maxY = Math.max(bounds.maxY, position[i + 1]);
    bounds.minZ = Math.min(bounds.minZ, position[i + 2]);
    bounds.maxZ = Math.max(bounds.maxZ, position[i + 2]);
  }
  return bounds;
}

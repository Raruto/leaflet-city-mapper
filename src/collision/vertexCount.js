/**
 * Return the number of indexed or sequential vertices represented by the geometry attributes.
 *
 * @param {Object} position Position attribute.
 * @param {Object|undefined} index Optional index attribute.
 *
 * @returns {number} Number of indices or sequential vertices.
 */
export function vertexCount(position, index) {
  return index?.count ?? index?.data.length ?? position.count ?? position.data.length / (position.size ?? 3);
}

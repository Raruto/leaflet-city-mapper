/**
 * Validate a completed MVT line or polygon path.
 *
 * @param {Array|null} path Current path, if any.
 * @param {number} type MVT geometry type.
 * @param {boolean} closed Whether the polygon path is closed.
 *
 * @throws {Error} If a line is too short or a polygon path is open.
 */
export function finishMvtPath(path, type, closed) {
  if (path && (type === 2 && path.length < 2 || type === 3 && !closed)) {
    throw /* alloc */ new Error('Incomplete MVT geometry');
  }
}

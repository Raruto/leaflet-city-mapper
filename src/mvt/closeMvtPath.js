/**
 * Close a valid polygon path by repeating its first point.
 *
 * @param {Object} state Mutable geometry decoding state.
 * @param {number} type MVT geometry type.
 * @param {number} count ClosePath command count.
 *
 * @throws {Error} If the close command or path is invalid.
 */
export function closeMvtPath(state, type, count) {
  if (type !== 3 || count !== 1 || !state.path || state.closed || state.path.length < 3) {
    throw /* alloc */ new Error('Invalid MVT ClosePath');
  }
  state.path.push(/* alloc */ [...state.path[0]]);
  state.closed = true;
}

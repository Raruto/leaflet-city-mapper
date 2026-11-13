/**
 * Decode delta-encoded MVT coordinates into the current path.
 *
 * @param {Array<number>} commands Geometry command integers.
 * @param {Object} state Mutable cursor, coordinate and path state.
 * @param {number} count Number of coordinate pairs.
 *
 * @throws {Error} If a coordinate integer exceeds the MVT 32-bit range.
 */
export function appendMvtCoordinates(commands, state, count) {
  let i = 0, dx, dy;
  for (; i < count; i++) {
    dx = commands[state.index++];
    dy = commands[state.index++];
    if (dx > 0xffffffff || dy > 0xffffffff) throw /* alloc */ new Error('Invalid MVT coordinate');
    state.x += dx % 2 ? -(dx + 1) / 2 : dx / 2;
    state.y += dy % 2 ? -(dy + 1) / 2 : dy / 2;
    state.path.push(/* alloc */ [state.x, state.y]);
  }
}

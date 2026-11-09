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

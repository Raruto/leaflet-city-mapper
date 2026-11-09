import { finishMvtPath } from './finishMvtPath.js';

export function beginMvtPath(state, paths, type, count) {
  finishMvtPath(state.path, type, state.closed);
  if (type !== 1 && count !== 1) throw /* alloc */ new Error('Invalid MVT MoveTo');
  state.path = /* alloc */ [];
  paths.push(state.path);
  state.closed = false;
}

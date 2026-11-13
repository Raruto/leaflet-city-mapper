import { finishMvtPath } from './finishMvtPath.js';

/**
 * Finish the previous geometry path and begin a new MoveTo path.
 *
 * @param {Object} state Mutable geometry decoding state.
 * @param {Array} paths Destination paths.
 * @param {number} type MVT geometry type.
 * @param {number} count MoveTo coordinate count.
 *
 * @throws {Error} If a non-point MoveTo count is not one.
 */
export function beginMvtPath(state, paths, type, count) {
  finishMvtPath(state.path, type, state.closed);
  if (type !== 1 && count !== 1) throw /* alloc */ new Error('Invalid MVT MoveTo');
  state.path = /* alloc */ [];
  paths.push(state.path);
  state.closed = false;
}

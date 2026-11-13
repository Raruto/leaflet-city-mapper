import { finishMvtPath } from './finishMvtPath.js';
import { appendMvtCoordinates } from './appendMvtCoordinates.js';
import { beginMvtPath } from './beginMvtPath.js';
import { closeMvtPath } from './closeMvtPath.js';

/**
 * Decode MVT geometry commands into tile-coordinate paths.
 *
 * @param {Array<number>} commands Geometry command integers.
 * @param {number} type MVT geometry type.
 *
 * @returns {Array} Decoded paths.
 *
 * @throws {Error} If a command or count is invalid.
 * @throws {Error} If geometry command parameters are invalid or truncated.
 * @throws {Error} If a LineTo is invalid for the current path.
 * @throws {Error} If no geometry path was decoded.
 */
export function readMvtGeometry(commands, type) {
  const paths = /* alloc */ [];
  const state = /* alloc */ { x: 0, y: 0, path: null, closed: false, index: 0 };
  let command, id, count;
  while (state.index < commands.length) {
    command = commands[state.index++];
    id = command % 8;
    count = Math.floor(command / 8);
    if (!count || command > 0xffffffff) throw /* alloc */ new Error('Invalid MVT geometry command');
    if (id === 7) {
      closeMvtPath(state, type, count);
      continue;
    }
    if (id !== 1 && id !== 2 || count > Math.floor((commands.length - state.index) / 2)) {
      throw /* alloc */ new Error('Invalid MVT geometry parameters');
    }
    if (id === 1) beginMvtPath(state, paths, type, count);
    else if (type === 1 || !state.path || state.closed) throw /* alloc */ new Error('Invalid MVT LineTo');
    appendMvtCoordinates(commands, state, count);
  }
  finishMvtPath(state.path, type, state.closed);
  if (!paths.length) throw /* alloc */ new Error('Empty MVT geometry');
  return paths;
}

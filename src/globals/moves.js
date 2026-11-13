/**
 * Walking key bindings as forward and turn multipliers: W/S move and A/D turn.
 *
 * @type {Object<string, Array<number>>}
 */
export const moves = {
  KeyW: [1, 0],
  ArrowUp: [1, 0],
  KeyS: [-1, 0],
  ArrowDown: [-1, 0],
  KeyD: [0, 1],
  ArrowRight: [0, 1],
  KeyA: [0, -1],
  ArrowLeft: [0, -1]
};

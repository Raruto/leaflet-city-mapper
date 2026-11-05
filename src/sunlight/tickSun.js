import { updateSun } from './updateSun.js';

export function tickSun(state) {
  if (state.control.live) updateSun(state);
}

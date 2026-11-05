import { updateSun } from './updateSun.js';

export function useLiveTime(state) {
  state.control.live = true;
  updateSun(state);
}

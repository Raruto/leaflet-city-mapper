import { loadTraffic } from './loadTraffic.js';

export function updateTraffic(state, event) {
  if (event?.layer && !event.layer.control?.time) return;
  cancelAnimationFrame(state.frame);
  loadTraffic(state);
  state.tick();
}

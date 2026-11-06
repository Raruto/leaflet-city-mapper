import { controlByLayer } from '../weakmaps/controlByLayer.js';



import { loadTraffic } from './loadTraffic.js';

export function updateTraffic(state, event) {
  if (event?.layer && !controlByLayer.get(event.layer)?.time) return;
  cancelAnimationFrame(state.frame);
  loadTraffic(state);
  state.tick();
}

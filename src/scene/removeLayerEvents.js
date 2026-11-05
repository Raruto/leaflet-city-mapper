import { sceneByLayer } from '../globals/sceneByLayer.js';



export function removeLayerEvents() {
  const state = sceneByLayer.get(this);
  state.eventMap.off(state.events, this);
  state.events = state.eventMap = null;
}

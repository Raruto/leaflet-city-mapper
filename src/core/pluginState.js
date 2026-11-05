import { state as sharedState } from '../state.js';


export function pluginState(object) {
  if (!object || !globalThis.L ||
      !(L.Map && object instanceof L.Map || L.Layer && object instanceof L.Layer ||
        L.Handler && object instanceof L.Handler || L.Draggable && object instanceof L.Draggable)) return object;
  let state = sharedState.instanceStates.get(object);
  if (!state) {
    state = /* allocation: required -- WeakMap entries isolate plugin state for each native Leaflet instance. */ {};
    sharedState.instanceStates.set(object, state);
  }
  return state;
}

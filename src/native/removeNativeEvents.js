import { nativeEventMaps } from '../weakmaps/nativeEventMaps.js';

/**
 * Unregister native layer event handling and restore map handling when unused.
 *
 * @param {Object} state Native layer state.
 */
export function removeNativeEvents(state) {
  const context = state._nativeEventContext;
  if (!context) return;
  const { map } = context;
  context.states.delete(state);
  if (context.hovered === state.source) {
    context.hovered = null;
    map.getContainer().style.cursor = '';
  }
  state._nativeEventContext = null;
  if (context.states.size) return;
  context.restore();
  nativeEventMaps.delete(map);
}

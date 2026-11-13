/**
 * Restore the map's original DOM event dispatcher if the native handler is still installed.
 */
export function restoreNativeEvents() {
  const { map, descriptor, handle } = this;
  if (map._fireDOMEvent !== handle) return;
  if (descriptor) Object.defineProperty(map, '_fireDOMEvent', descriptor);
  else delete map._fireDOMEvent;
}

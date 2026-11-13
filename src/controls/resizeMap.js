/**
 * Invalidate the map size associated with the first observed container.
 *
 * @param {Array<ResizeObserverEntry>} entries Resize observer entries.
 */
export function resizeMap(entries) {
  entries[0]?.target._containerResizeMap.invalidateSize();
}

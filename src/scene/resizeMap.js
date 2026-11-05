export function resizeMap(entries) {
  entries[0]?.target._containerResizeMap.invalidateSize();
}

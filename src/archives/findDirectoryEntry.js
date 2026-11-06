export function findDirectoryEntry(entries, id) {
  let low = 0, high = entries.length - 1, mid;
  while (low <= high) {
    mid = (low + high) >> 1;
    if (entries[mid].tileId <= id) low = mid + 1;
    else high = mid - 1;
  }
  return entries[high];
}

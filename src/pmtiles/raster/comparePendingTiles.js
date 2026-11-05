

export function comparePendingTiles(a, b) {
  return a.tile.coords.z - b.tile.coords.z || a.distance - b.distance;
}

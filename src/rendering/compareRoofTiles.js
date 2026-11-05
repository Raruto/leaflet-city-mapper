export function compareRoofTiles(a, b) {
  return (a.layer.options.zIndex || 0) - (b.layer.options.zIndex || 0) ||
    a.tile.coords.z - b.tile.coords.z;
}

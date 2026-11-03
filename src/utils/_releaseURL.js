export function _releaseURL(tile) {
  if (tile.objectURL) {
    URL.revokeObjectURL(tile.objectURL);
    tile.objectURL = null;
  }
}

import { sceneByLayer } from '../globals/sceneByLayer.js';

export function collectRoofTiles(rasters, tiles) {
  let zoom = -Infinity, layer, tile;
  for (layer of rasters) {
    for (tile of sceneByLayer.get(layer)._rasterTiles.values()) {
      if (tile.done && !tile.request.signal.aborted && tile.image) {
        tile._roofEntry ||= /* alloc */ { tile, layer };
        tiles.push(tile._roofEntry);
        zoom = Math.max(zoom, tile.coords.z);
      }
    }
  }
  return zoom;
}

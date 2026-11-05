import { L } from '../globals/L.js';
import { TILE_SIZE } from '../globals/TILE_SIZE.js';


export function getRasterTileSize() {
  return /* allocation: required -- Leaflet callers own the returned mutable point and may scale or modify it. */ new L.Point(TILE_SIZE, TILE_SIZE);
}

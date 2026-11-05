import { TILE_SIZE } from './constants/TILE_SIZE.js';

export function getRasterTileSize() {
  return new L.Point(TILE_SIZE, TILE_SIZE);
}

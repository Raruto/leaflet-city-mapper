import { state as sharedState } from '../state.js';

export function getRasterTileSize() {
  return /* allocation: required -- Leaflet callers own the returned mutable point and may scale or modify it. */ new L.Point(sharedState.TILE_SIZE, sharedState.TILE_SIZE);
}

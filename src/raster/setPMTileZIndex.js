import { setRasterZIndex } from './setRasterZIndex.js';

export function setPMTileZIndex(layer, zIndex) {
  layer.options.zIndex = zIndex;
  setRasterZIndex(layer, zIndex);
  return layer;
}

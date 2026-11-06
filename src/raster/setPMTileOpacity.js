import { setRasterOpacity } from './setRasterOpacity.js';

export function setPMTileOpacity(layer, opacity) {
  layer.options.opacity = opacity;
  setRasterOpacity(layer, opacity);
  return layer;
}

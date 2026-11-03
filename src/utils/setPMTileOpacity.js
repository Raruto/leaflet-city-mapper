import { setRasterOpacity } from './rasterTiles.js';

export function setPMTileOpacity(backend, opacity) {
  backend.options.opacity = opacity;
  setRasterOpacity(backend, opacity);
  return backend;
}

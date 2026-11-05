import { setRasterZIndex } from './setRasterZIndex.js';

export function setPMTileZIndex(backend, zIndex) {
  backend.options.zIndex = zIndex;
  setRasterZIndex(backend, zIndex);
  return backend;
}

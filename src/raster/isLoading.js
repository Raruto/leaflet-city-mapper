import { loadingTilesByLayer } from '../weakmaps/loadingTilesByLayer.js';




export function isLoading(layer) {
  return loadingTilesByLayer.get(layer) > 0;
}

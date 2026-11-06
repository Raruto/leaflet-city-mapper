import { loadingTilesByLayer } from '../weakmaps/loadingTilesByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';



import { finishRasterTile } from './finishRasterTile.js';

export function loadRasterTile(layer, tile) {
  tile.started = true;
  const first = loadingTilesByLayer.get(layer) === 0;
  mutateWeakMap(loadingTilesByLayer, layer, "++", undefined, false);
  layer.fire('tileloadstart', /* alloc */ { tile, coords: tile.coords });
  if (first) layer.fire('loading');
  return finishRasterTile(layer, tile);
}

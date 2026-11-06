import { rasterGeometryByLayer } from '../weakmaps/rasterGeometryByLayer.js';
import { rasterProgramByLayer } from '../weakmaps/rasterProgramByLayer.js';
import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';



import { destroyTexture } from '../rendering/destroyTexture.js';
import { releaseRasterTile } from './releaseRasterTile.js';

export function releaseRasterTiles(layer) {
  let tile, attribute;
  for (tile of rasterTilesByLayer.get(layer).values()) releaseRasterTile(layer, tile);
  rasterProgramByLayer.get(layer)?.pipelineCache.clear();
  mutateWeakMap(rasterProgramByLayer, layer, "=", null);
  if (rasterGeometryByLayer.get(layer)) {
    for (attribute of Object.values(rasterGeometryByLayer.get(layer).attributes)) {
      destroyTexture(layer, attribute.buffer);
    }
    mutateWeakMap(rasterGeometryByLayer, layer, "=", null);
  }
}

import { destroyTexture } from '../rendering/destroyTexture.js';
import { releaseRasterTile } from './releaseRasterTile.js';

export function releaseRasterTiles(backend) {
  let tile, attribute;
  for (tile of backend._rasterTiles.values()) releaseRasterTile(backend, tile);
  backend._rasterProgram?.pipelineCache.clear();
  backend._rasterProgram = null;
  if (backend._rasterGeometry) {
    for (attribute of Object.values(backend._rasterGeometry.attributes)) {
      destroyTexture(backend, attribute.buffer);
    }
    backend._rasterGeometry = null;
  }
}

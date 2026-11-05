import { destroyTexture } from '../../rendering/textures/destroyTexture.js';
import { releaseRasterTile } from './releaseRasterTile.js';

export function releaseRasterTiles(backend) {
  for (const tile of backend._rasterTiles.values()) releaseRasterTile(backend, tile);
  backend._rasterProgram?.pipelineCache.clear();
  backend._rasterProgram = null;
  if (backend._rasterGeometry) {
    for (const attribute of Object.values(backend._rasterGeometry.attributes)) {
      destroyTexture(backend, attribute.buffer);
    }
    backend._rasterGeometry = null;
  }
}

import { pluginState } from '../core/pluginState.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { releaseRasterTile } from './releaseRasterTile.js';

export function releaseRasterTiles(backend) {
  let tile, attribute;
  for (tile of pluginState(backend)._rasterTiles.values()) releaseRasterTile(backend, tile);
  pluginState(backend)._rasterProgram?.pipelineCache.clear();
  pluginState(backend)._rasterProgram = null;
  if (pluginState(backend)._rasterGeometry) {
    for (attribute of Object.values(pluginState(backend)._rasterGeometry.attributes)) {
      destroyTexture(backend, attribute.buffer);
    }
    pluginState(backend)._rasterGeometry = null;
  }
}

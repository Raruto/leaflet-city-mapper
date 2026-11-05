import { sceneByLayer } from '../globals/sceneByLayer.js';


import { destroyTexture } from '../rendering/destroyTexture.js';
import { releaseRasterTile } from './releaseRasterTile.js';

export function releaseRasterTiles(backend) {
  let tile, attribute;
  for (tile of sceneByLayer.get(backend)._rasterTiles.values()) releaseRasterTile(backend, tile);
  sceneByLayer.get(backend)._rasterProgram?.pipelineCache.clear();
  sceneByLayer.get(backend)._rasterProgram = null;
  if (sceneByLayer.get(backend)._rasterGeometry) {
    for (attribute of Object.values(sceneByLayer.get(backend)._rasterGeometry.attributes)) {
      destroyTexture(backend, attribute.buffer);
    }
    sceneByLayer.get(backend)._rasterGeometry = null;
  }
}

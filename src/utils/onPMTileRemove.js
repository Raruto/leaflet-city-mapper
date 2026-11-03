import { releaseRasterTiles } from './rasterTiles.js';

export function onPMTileRemove(backend, map) {
  releaseRasterTiles(backend);
  backend._terrain3D = null;
  L.Layer.types['3d'].prototype.onRemove.call(backend, map);
}

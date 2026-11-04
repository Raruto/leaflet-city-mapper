import { releaseRasterTiles } from './rasterTiles.js';
import { onRemove3DLayer } from './onRemove3DLayer.js';

export function onPMTileRemove(backend, map) {
  releaseRasterTiles(backend);
  backend._terrain3D = null;
  onRemove3DLayer(backend, map);
}

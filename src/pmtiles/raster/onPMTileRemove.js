import { releaseRasterTiles } from './releaseRasterTiles.js';
import { onRemove3DLayer } from '../../scene/lifecycle/onRemove3DLayer.js';

export function onPMTileRemove(backend, map) {
  releaseRasterTiles(backend);
  backend._terrain3D = null;
  onRemove3DLayer(backend, map);
}

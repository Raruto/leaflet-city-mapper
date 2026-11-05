import { pluginState } from '../core/pluginState.js';
import { releaseRasterTiles } from './releaseRasterTiles.js';
import { onRemove3DLayer } from '../scene/onRemove3DLayer.js';

export function onPMTileRemove(backend, map) {
  releaseRasterTiles(backend);
  pluginState(backend)._terrain3D = null;
  onRemove3DLayer(backend, map);
}

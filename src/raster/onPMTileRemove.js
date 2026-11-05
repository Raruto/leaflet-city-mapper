import { sceneByLayer } from '../globals/sceneByLayer.js';


import { releaseRasterTiles } from './releaseRasterTiles.js';
import { onRemove3DLayer } from '../scene/onRemove3DLayer.js';

export function onPMTileRemove(backend, map) {
  releaseRasterTiles(backend);
  sceneByLayer.get(backend)._terrain3D = null;
  onRemove3DLayer(backend, map);
}

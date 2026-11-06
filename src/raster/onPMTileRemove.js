import { terrain3DByLayer } from '../weakmaps/terrain3DByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';



import { releaseRasterTiles } from './releaseRasterTiles.js';
import { onRemove3DLayer } from '../scene/onRemove3DLayer.js';

export function onPMTileRemove(layer, map) {
  releaseRasterTiles(layer);
  mutateWeakMap(terrain3DByLayer, layer, "=", null);
  onRemove3DLayer(layer, map);
}

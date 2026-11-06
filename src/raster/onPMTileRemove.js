import { terrain3DByLayer } from '../weakmaps/terrain3DByLayer.js';



import { releaseRasterTiles } from './releaseRasterTiles.js';
import { onRemove3DLayer } from '../scene/onRemove3DLayer.js';

export function onPMTileRemove(layer, map) {
  releaseRasterTiles(layer);
  terrain3DByLayer.set(layer, null);
  onRemove3DLayer(layer, map);
}

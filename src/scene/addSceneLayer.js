import { sceneByLayer } from '../globals/sceneByLayer.js';

import { onAdd3DLayer } from './onAdd3DLayer.js';
import { onPMTileAdd } from '../raster/onPMTileAdd.js';
import { onTerrainAdd } from '../terrain/onTerrainAdd.js';
import { addRasterImage } from '../core/addRasterImage.js';
import { addTimeLayer } from '../sunlight/addTimeLayer.js';

export function addSceneLayer(layer, map) {
  switch (sceneByLayer.get(layer).kind) {
    case '3d': return onAdd3DLayer(layer, map);
    case 'raster': return onPMTileAdd(layer, map);
    case 'terrain': return onTerrainAdd(layer, map);
    case 'image': return addRasterImage.call(layer, map);
    case 'time': return addTimeLayer.call(layer, map);
  }
}

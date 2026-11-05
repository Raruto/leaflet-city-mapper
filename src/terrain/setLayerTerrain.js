import { sceneByLayer } from '../globals/sceneByLayer.js';


import { setRasterTerrain } from '../raster/setRasterTerrain.js';

export function setLayerTerrain(layer) {
  if (sceneByLayer.get(layer).kind === 'raster') setRasterTerrain(layer, this);
}

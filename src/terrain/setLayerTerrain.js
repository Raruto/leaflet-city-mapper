import { sceneByLayer } from '../globals/sceneByLayer.js';


import { setRasterTerrain } from '../raster/setRasterTerrain.js';

export function setLayerTerrain(layer) {
  if (sceneByLayer.get(layer)._type === 'pmtiles') setRasterTerrain(layer, this);
}

import { kindByLayer } from '../weakmaps/kindByLayer.js';



import { setRasterTerrain } from '../raster/setRasterTerrain.js';

export function setLayerTerrain(layer) {
  if (kindByLayer.get(layer) === 'raster') setRasterTerrain(layer, this);
}

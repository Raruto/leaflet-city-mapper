import { setRasterTerrain } from '../pmtiles/raster/setRasterTerrain.js';

export function setLayerTerrain(layer) {
  if (layer._type === 'pmtiles') setRasterTerrain(layer, this);
}

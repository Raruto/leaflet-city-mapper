import { setRasterTerrain } from '../pmtiles/raster/setRasterTerrain.js';

export function clearLayerTerrain(layer) {
  if (layer._type === 'pmtiles') setRasterTerrain(layer, null);
}

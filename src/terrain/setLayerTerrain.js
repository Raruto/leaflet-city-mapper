import { setRasterTerrain } from '../pmtiles/setRasterTerrain.js';

export function setLayerTerrain(layer) {
  if (layer._type === 'pmtiles') setRasterTerrain(layer, this);
}

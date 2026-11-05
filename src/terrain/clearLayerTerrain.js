import { pluginState } from '../core/pluginState.js';
import { setRasterTerrain } from '../raster/setRasterTerrain.js';

export function clearLayerTerrain(layer) {
  if (pluginState(layer)._type === 'pmtiles') setRasterTerrain(layer, null);
}

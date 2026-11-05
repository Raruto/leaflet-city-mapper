import { sceneByLayer } from '../globals/sceneByLayer.js';

import { setGeoJSONData } from '../sources/setGeoJSONData.js';
import { getHeader } from '../archives/getHeader.js';
import { getZxy } from '../archives/getZxy.js';
import { getRasterTileSize } from '../raster/getRasterTileSize.js';
import { isLoading } from '../raster/isLoading.js';
import { setPMTileOpacity } from '../raster/setPMTileOpacity.js';
import { setPMTileZIndex } from '../raster/setPMTileZIndex.js';


export function callLayer(method, layer, ...args) {
  const scene = sceneByLayer.get(layer);
  if (method === 'setData' && scene?._geojson) return setGeoJSONData(layer, ...args);
  if (scene?.kind === 'raster') {
    switch (method) {
      case 'getHeader': return getHeader(layer);
      case 'getZxy': return getZxy(layer, ...args);
      case 'getTileSize': return getRasterTileSize();
      case 'isLoading': return isLoading(layer);
      case 'setOpacity': return setPMTileOpacity(layer, ...args);
      case 'setZIndex': return setPMTileZIndex(layer, ...args);
    }
  }
  return layer[method](...args);
}

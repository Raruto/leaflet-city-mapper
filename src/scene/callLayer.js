import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { kindByLayer } from '../weakmaps/kindByLayer.js';


import { setGeoJSONData } from '../sources/setGeoJSONData.js';
import { getHeader } from '../archives/getHeader.js';
import { getZxy } from '../archives/getZxy.js';
import { getRasterTileSize } from '../raster/getRasterTileSize.js';
import { isLoading } from '../raster/isLoading.js';
import { setPMTileOpacity } from '../raster/setPMTileOpacity.js';
import { setPMTileZIndex } from '../raster/setPMTileZIndex.js';


export function callLayer(method, layer, ...args) {

  if (method === 'setData' && geojsonByLayer.get(layer)) return setGeoJSONData(layer, ...args);
  if (kindByLayer.get(layer) === 'raster') {
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

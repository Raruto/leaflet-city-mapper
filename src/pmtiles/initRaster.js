import { isLoading } from './raster/isLoading.js';
import { getRasterEvents } from './raster/getRasterEvents.js';
import { readyRaster } from './raster/readyRaster.js';
import { reportError } from './raster/reportError.js';
import { emptyNode } from '../scene/graph/emptyNode.js';
import { read } from './archive/read.js';
import { getHeader } from './archive/getHeader.js';
import { getZxy } from './archive/getZxy.js';
import { onPMTileAdd } from './raster/onPMTileAdd.js';
import { onPMTileRemove } from './raster/onPMTileRemove.js';
import { getRasterTileSize } from './raster/getRasterTileSize.js';
import { setPMTileOpacity } from './raster/setPMTileOpacity.js';
import { setPMTileZIndex } from './raster/setPMTileZIndex.js';

export function initRaster(layer, options) {
  layer._read = read.bind(null, layer);
  layer.getHeader = getHeader.bind(null, layer);
  layer.getZxy = getZxy.bind(null, layer);
  layer.getTileSize = getRasterTileSize;
  layer.isLoading = isLoading.bind(null, layer);
  layer.setOpacity = setPMTileOpacity.bind(null, layer);
  layer.setZIndex = setPMTileZIndex.bind(null, layer);
  layer.onAdd = onPMTileAdd.bind(null, layer);
  layer.onRemove = onPMTileRemove.bind(null, layer);
  layer.getEvents = getRasterEvents.bind(null, layer);
  options = { ariaLabel: 'PMTiles raster', maxZoom: 18, opacity: 1, zIndex: 0, ...options };
  L.Util.setOptions(layer, options);
  layer.root = emptyNode();
  layer._areas = new Map();
  layer._rasterTiles = new Map();
  layer._loadingTiles = 0;
  layer._added = Promise.withResolvers();
  layer.url = new URL(options.url, document.baseURI).href;
  layer._directories = new Map();
  layer.ready = Promise.resolve(layer.options.archive || layer)
    .then(readyRaster.bind(null, layer))
    .catch(reportError.bind(null, layer));
}

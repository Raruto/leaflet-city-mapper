import { isLoading } from './isLoading.js';
import { getRasterEvents } from './getRasterEvents.js';
import { readyRaster } from './readyRaster.js';
import { reportError } from './reportError.js';
import { emptyNode } from '../scene/emptyNode.js';
import { read } from './read.js';
import { getHeader } from './getHeader.js';
import { getZxy } from './getZxy.js';
import { onPMTileAdd } from './onPMTileAdd.js';
import { onPMTileRemove } from './onPMTileRemove.js';
import { getRasterTileSize } from './getRasterTileSize.js';
import { setPMTileOpacity } from './setPMTileOpacity.js';
import { setPMTileZIndex } from './setPMTileZIndex.js';

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

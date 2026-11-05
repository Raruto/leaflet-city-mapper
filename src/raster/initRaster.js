import { pluginState } from '../core/pluginState.js';
import { isLoading } from './isLoading.js';
import { getRasterEvents } from './getRasterEvents.js';
import { readyRaster } from './readyRaster.js';
import { reportError } from './reportError.js';
import { emptyNode } from '../scene/emptyNode.js';
import { read } from '../archives/read.js';
import { getHeader } from '../archives/getHeader.js';
import { getZxy } from '../archives/getZxy.js';
import { onPMTileAdd } from './onPMTileAdd.js';
import { onPMTileRemove } from './onPMTileRemove.js';
import { getRasterTileSize } from './getRasterTileSize.js';
import { setPMTileOpacity } from './setPMTileOpacity.js';
import { setPMTileZIndex } from './setPMTileZIndex.js';

export function initRaster(layer, options) {
  pluginState(layer)._read = read.bind(null, layer);
  pluginState(layer).getHeader = getHeader.bind(null, layer);
  pluginState(layer).getZxy = getZxy.bind(null, layer);
  pluginState(layer).getTileSize = getRasterTileSize;
  pluginState(layer).isLoading = isLoading.bind(null, layer);
  pluginState(layer).setOpacity = setPMTileOpacity.bind(null, layer);
  pluginState(layer).setZIndex = setPMTileZIndex.bind(null, layer);
  pluginState(layer).onAdd = onPMTileAdd.bind(null, layer);
  pluginState(layer).onRemove = onPMTileRemove.bind(null, layer);
  pluginState(layer).getEvents = getRasterEvents.bind(null, layer);
  options = /* allocation: required -- Leaflet retains these per-layer merged options for the layer lifetime. */ { ariaLabel: 'PMTiles raster', maxZoom: 18, opacity: 1, zIndex: 0, ...options };
  L.Util.setOptions(layer, options);
  pluginState(layer).root = emptyNode();
  pluginState(layer)._areas = /* allocation: required -- Each raster layer owns its area lifecycle map. */ new Map();
  pluginState(layer)._rasterTiles = /* allocation: required -- Each raster layer owns its independently cancellable tile map. */ new Map();
  pluginState(layer)._loadingTiles = 0;
  pluginState(layer)._added = Promise.withResolvers();
  pluginState(layer).url = /* allocation: required -- Resolve this layer’s source against the runtime document base without sharing mutable URL parsing state. */ new URL(options.url, document.baseURI).href;
  pluginState(layer)._directories = /* allocation: required -- Each archive-backed layer retains its own directory cache. */ new Map();
  pluginState(layer).ready = Promise.resolve(layer.options.archive || layer)
    .then(readyRaster.bind(null, layer))
    .catch(reportError.bind(null, layer));
}

import { sceneByLayer } from '../globals/sceneByLayer.js';


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
  sceneByLayer.get(layer).kind = 'raster';
  options = /* allocation: required -- Leaflet retains these per-layer merged options for the layer lifetime. */ { ariaLabel: 'PMTiles raster', maxZoom: 18, opacity: 1, zIndex: 0, ...options };
  L.Util.setOptions(layer, options);
  sceneByLayer.get(layer).root = emptyNode();
  sceneByLayer.get(layer)._areas = /* allocation: required -- Each raster layer owns its area lifecycle map. */ new Map();
  sceneByLayer.get(layer)._rasterTiles = /* allocation: required -- Each raster layer owns its independently cancellable tile map. */ new Map();
  sceneByLayer.get(layer)._loadingTiles = 0;
  sceneByLayer.get(layer)._added = Promise.withResolvers();
  sceneByLayer.get(layer).url = /* allocation: required -- Resolve this layer’s source against the runtime document base without sharing mutable URL parsing state. */ new URL(options.url, document.baseURI).href;
  sceneByLayer.get(layer)._directories = /* allocation: required -- Each archive-backed layer retains its own directory cache. */ new Map();
  sceneByLayer.get(layer).ready = Promise.resolve(layer.options.archive || layer)
    .then(readyRaster.bind(null, layer))
    .catch(reportError.bind(null, layer));
}

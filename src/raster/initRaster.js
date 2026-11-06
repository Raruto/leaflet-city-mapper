import { addedByLayer } from '../weakmaps/addedByLayer.js';
import { areasByLayer } from '../weakmaps/areasByLayer.js';
import { directoriesByLayer } from '../weakmaps/directoriesByLayer.js';
import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { loadingTilesByLayer } from '../weakmaps/loadingTilesByLayer.js';
import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { readyByLayer } from '../weakmaps/readyByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { urlByLayer } from '../weakmaps/urlByLayer.js';

import { L } from '../globals/L.js';


import { isLoading } from './isRasterLoading.js';
import { getRasterEvents } from './getRasterEvents.js';
import { readyRaster } from './readyRaster.js';
import { reportError } from './reportRasterError.js';
import { emptyNode } from '../scene/createSceneNode.js';
import { read } from '../archives/readArchiveRange.js';
import { getHeader } from '../archives/getHeader.js';
import { getZxy } from '../archives/getZxy.js';
import { onPMTileAdd } from './onPMTileAdd.js';
import { onPMTileRemove } from './onPMTileRemove.js';
import { getRasterTileSize } from './getRasterTileSize.js';
import { setPMTileOpacity } from './setPMTileOpacity.js';
import { setPMTileZIndex } from './setPMTileZIndex.js';

export function initRaster(layer, options) {
  kindByLayer.set(layer, 'raster');
  options = /* alloc */ { ariaLabel: 'PMTiles raster', maxZoom: 18, opacity: 1, zIndex: 0, ...options };
  L.Util.setOptions(layer, options);
  rootByLayer.set(layer, emptyNode());
  areasByLayer.set(layer, /* alloc */ new Map());
  rasterTilesByLayer.set(layer, /* alloc */ new Map());
  loadingTilesByLayer.set(layer, 0);
  addedByLayer.set(layer, Promise.withResolvers());
  urlByLayer.set(layer, /* alloc */ new URL(options.url, document.baseURI).href);
  directoriesByLayer.set(layer, /* alloc */ new Map());
  readyByLayer.set(layer, Promise.resolve(layer.options.archive || layer)
    .then(readyRaster.bind(null, layer))
    .catch(reportError.bind(null, layer)));
}
